import { useNewsContext } from '../context/NewsContext';

export function useNews() {
  return useNewsContext();
}
