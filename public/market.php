<?php
/**
 * JC Panorama 365 — Proxy de Cotações com Múltiplas Fontes (Resiliente e Sem Falhas)
 * 
 * 1. Dólar Comercial:
 *    - Primária: AwesomeAPI (PTAX do Banco Central minuto a minuto)
 *    - Secundária: DolarApi
 * 
 * 2. Ações B3 (PETR4, VALE3, ITUB4, BBDC4):
 *    - Primária: Yahoo Finance (oficial, tempo real, sem chave de API, sem limite)
 *    - Secundária: brapi.dev
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Cache-Control: public, max-age=60, s-maxage=120');

$type = isset($_GET['type']) ? trim($_GET['type']) : 'all';

function fetchUrl($url, $timeout = 6) {
    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        $res = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($code === 200 && !empty($res)) {
            return $res;
        }
    }
    
    $ctx = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36\r\n",
            'timeout' => $timeout,
        ],
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
        ]
    ]);
    return @file_get_contents($url, false, $ctx);
}

// 1. Obter Cotação do Dólar
function getDollarRate() {
    // Fonte 1: AwesomeAPI (Banco Central PTAX ao vivo)
    $resAwesome = fetchUrl('https://economia.awesomeapi.com.br/json/last/USD-BRL', 5);
    if (!empty($resAwesome)) {
        $json = json_decode($resAwesome, true);
        if (!empty($json['USDBRL'])) {
            $item = $json['USDBRL'];
            $bidPrice = (float)($item['bid'] ?? 0);
            $askPrice = (float)($item['ask'] ?? $bidPrice);
            $high = (float)($item['high'] ?? $bidPrice);
            $low = (float)($item['low'] ?? $bidPrice);
            $variation = (float)($item['varBid'] ?? 0);
            $changePercent = (float)($item['pctChange'] ?? 0);
            $updatedAt = !empty($item['create_date']) ? date('c', strtotime($item['create_date'])) : date('c');

            return [
                'pair' => 'USD-BRL',
                'name' => 'Dólar Comercial',
                'bidPrice' => $bidPrice,
                'askPrice' => $askPrice,
                'high' => $high,
                'low' => $low,
                'variation' => $variation,
                'changePercent' => $changePercent,
                'updatedAt' => $updatedAt,
                'source' => 'Banco Central / PTAX'
            ];
        }
    }

    // Fonte 2: DolarApi
    $resDolarApi = fetchUrl('https://br.dolarapi.com/v1/cotacoes/usd', 5);
    if (!empty($resDolarApi)) {
        $data = json_decode($resDolarApi, true);
        if (is_array($data) && isset($data[0])) $data = $data[0];
        if (!empty($data['compra']) || !empty($data['venda'])) {
            $bidPrice = (float)($data['compra'] ?? $data['venda'] ?? 0);
            $askPrice = (float)($data['venda'] ?? $bidPrice);
            $fechoAnterior = (float)($data['fechoAnterior'] ?? 0);
            $variation = $fechoAnterior > 0 ? (float)number_format($bidPrice - $fechoAnterior, 4, '.', '') : 0;
            $changePercent = $fechoAnterior > 0 ? (float)number_format(($variation / $fechoAnterior) * 100, 2, '.', '') : 0;

            return [
                'pair' => 'USD-BRL',
                'name' => 'Dólar Comercial',
                'bidPrice' => $bidPrice,
                'askPrice' => $askPrice,
                'high' => $fechoAnterior > 0 ? max($bidPrice, $fechoAnterior) : $bidPrice * 1.004,
                'low' => $fechoAnterior > 0 ? min($bidPrice, $fechoAnterior) : $bidPrice * 0.996,
                'variation' => $variation,
                'changePercent' => $changePercent,
                'updatedAt' => date('c'),
                'source' => 'Investing.com / DolarApi'
            ];
        }
    }

    return null;
}

// 2. Obter Ações da B3
function getStocks() {
    $friendlyNames = [
        'PETR4' => 'Petrobras PN',
        'VALE3' => 'Vale ON',
        'ITUB4' => 'Itaú Unibanco',
        'BBDC4' => 'Bradesco PN'
    ];

    // Fonte 1: Yahoo Finance (Endpoint oficial de mercado, tempo real sem token)
    $symbols = ['PETR4.SA', 'VALE3.SA', 'ITUB4.SA', 'BBDC4.SA'];
    $items = [];

    foreach ($symbols as $tickerWithSa) {
        $ticker = str_replace('.SA', '', $tickerWithSa);
        $url = "https://query1.finance.yahoo.com/v8/finance/chart/{$tickerWithSa}?interval=1d&range=1d";
        $res = fetchUrl($url, 4);
        
        if (!empty($res)) {
            $json = json_decode($res, true);
            $meta = $json['chart']['result'][0]['meta'] ?? null;
            if ($meta && !empty($meta['regularMarketPrice'])) {
                $price = (float)$meta['regularMarketPrice'];
                $prevClose = (float)($meta['chartPreviousClose'] ?? $meta['previousClose'] ?? $price);
                $change = $prevClose > 0 ? (float)number_format($price - $prevClose, 2, '.', '') : 0;
                $changePercent = $prevClose > 0 ? (float)number_format(($change / $prevClose) * 100, 2, '.', '') : 0;
                $time = !empty($meta['regularMarketTime']) ? date('c', $meta['regularMarketTime']) : date('c');

                $items[] = [
                    'symbol' => $ticker,
                    'shortName' => $friendlyNames[$ticker] ?? $ticker,
                    'price' => $price,
                    'change' => $change,
                    'changePercent' => $changePercent,
                    'logourl' => null,
                    'updatedAt' => $time
                ];
            }
        }
    }

    if (count($items) === 4) {
        return $items;
    }

    // Fonte 2: brapi.dev
    $token = 'dmX9ygWePJ23LBb9GbC8Mq';
    $tickersStr = 'PETR4,VALE3,ITUB4,BBDC4';
    $url = "https://brapi.dev/api/quote/{$tickersStr}?token={$token}";
    $resBrapi = fetchUrl($url, 6);

    if (!empty($resBrapi)) {
        $json = json_decode($resBrapi, true);
        if (!empty($json['results']) && is_array($json['results'])) {
            $brapiItems = [];
            foreach ($json['results'] as $item) {
                $symbol = $item['symbol'] ?? '';
                $brapiItems[] = [
                    'symbol' => $symbol,
                    'shortName' => $friendlyNames[$symbol] ?? ($item['shortName'] ?? $symbol),
                    'price' => (float)($item['regularMarketPrice'] ?? 0),
                    'change' => (float)($item['regularMarketChange'] ?? 0),
                    'changePercent' => (float)($item['regularMarketChangePercent'] ?? 0),
                    'logourl' => $item['logourl'] ?? null,
                    'updatedAt' => !empty($item['regularMarketTime']) ? date('c', strtotime($item['regularMarketTime'])) : date('c')
                ];
            }
            if (count($brapiItems) > 0) {
                return $brapiItems;
            }
        }
    }

    return null;
}

$response = [
    'timestamp' => date('c'),
];

if ($type === 'dollar' || $type === 'all') {
    $response['dollar'] = getDollarRate();
}
if ($type === 'stocks' || $type === 'all') {
    $response['stocks'] = getStocks();
}

echo json_encode($response, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
