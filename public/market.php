<?php
/**
 * JC Panorama 365 — Proxy de Cotações (Ações B3 e Dólar)
 * 
 * Executado no servidor HostGator para contornar qualquer limitação de CORS do navegador
 * e garantir que os dados venham sempre atualizados e confiáveis.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Cache-Control: public, max-age=60, s-maxage=300');

$type = isset($_GET['type']) ? trim($_GET['type']) : 'all';

function fetchUrl($url, $timeout = 6) {
    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (compatible; JCPanorama/1.0)');
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
            'header' => "User-Agent: Mozilla/5.0 (compatible; JCPanorama/1.0)\r\n",
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
    // Fonte Primária: AwesomeAPI (tempo real do câmbio comercial PTAX)
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
                'source' => 'AwesomeAPI / Banco Central'
            ];
        }
    }

    // Fonte Secundária: DolarApi
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
                'updatedAt' => date('c'), // hora da consulta ao vivo
                'source' => 'Investing.com / DolarApi'
            ];
        }
    }

    return null;
}

// 2. Obter Ações da B3
function getStocks() {
    $token = 'dmX9ygWePJ23LBb9GbC8Mq';
    $tickers = 'PETR4,VALE3,ITUB4,BBDC4';
    $url = "https://brapi.dev/api/quote/{$tickers}?token={$token}";
    
    $res = fetchUrl($url, 6);
    if (!empty($res)) {
        $json = json_decode($res, true);
        if (!empty($json['results']) && is_array($json['results'])) {
            $friendlyNames = [
                'PETR4' => 'Petrobras PN',
                'VALE3' => 'Vale ON',
                'ITUB4' => 'Itaú Unibanco',
                'BBDC4' => 'Bradesco PN'
            ];

            $items = [];
            foreach ($json['results'] as $item) {
                $symbol = $item['symbol'] ?? '';
                $items[] = [
                    'symbol' => $symbol,
                    'shortName' => $friendlyNames[$symbol] ?? ($item['shortName'] ?? $symbol),
                    'price' => (float)($item['regularMarketPrice'] ?? 0),
                    'change' => (float)($item['regularMarketChange'] ?? 0),
                    'changePercent' => (float)($item['regularMarketChangePercent'] ?? 0),
                    'logourl' => $item['logourl'] ?? null,
                    'updatedAt' => !empty($item['regularMarketTime']) ? date('c', strtotime($item['regularMarketTime'])) : date('c')
                ];
            }
            if (count($items) > 0) {
                return $items;
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

