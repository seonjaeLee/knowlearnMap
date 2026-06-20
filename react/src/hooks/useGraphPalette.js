import { useTheme } from '../context/ThemeContext';

/**
 * react-force-graph-2d(canvas) 공용 색 팔레트 — MiniKnowledgeGraph·KnowledgeGraphModal·KnowledgeMapView 공유.
 * 캔버스는 직접 그려서 CSS 토큰이 안 닿으므로, 여기서 라이트/다크 값을 한 곳에서 관리한다.
 */
export const GRAPH_PALETTE = {
  light: {
    background: '#ffffff',
    nodeDefault: '#9BBFEE',
    nodeSearch: '#ff6b6b',
    nodeTopHub: '#1565c0',
    nodeHub: '#4a90d9',
    nodeLabel: '#444444',
    nodeBorderExpandable: '#1976d2',
    nodeBorderExpanded: '#4CAF50',
    nodeBorderDefault: '#6688AA',
    nodeBorderPath: '#333333',
    searchHighlight: 'rgba(255, 215, 0, 0.5)',
    pathStartGlow: 'rgba(76, 175, 80, 0.4)',
    pathMidGlow: 'rgba(255, 152, 0, 0.4)',
    pathEndGlow: 'rgba(244, 67, 54, 0.4)',
    edge: '#B0B0B0',
    pathEdge: '#FF5722',
    edgeLabelBg: 'rgba(255, 255, 255, 0.85)',
    edgeLabelText: '#888888',
    legendBg: 'rgba(255, 255, 255, 0.9)',
    legendDivider: '#dddddd',
    pathStart: '#4CAF50',
    pathMid: '#FF9800',
    pathEnd: '#F44336',
    pathLabel: '#ffffff',
  },
  dark: {
    background: '#171a20',
    nodeDefault: '#7ea6e0',
    nodeSearch: '#ff8a80',
    nodeTopHub: '#6b9cf0',
    nodeHub: '#5a7fc0',
    nodeLabel: '#e9ecf1',
    nodeBorderExpandable: '#6b9cf0',
    nodeBorderExpanded: '#5fd99b',
    nodeBorderDefault: '#4b5563',
    nodeBorderPath: '#e9ecf1',
    searchHighlight: 'rgba(240, 180, 41, 0.45)',
    pathStartGlow: 'rgba(95, 217, 155, 0.35)',
    pathMidGlow: 'rgba(240, 180, 41, 0.35)',
    pathEndGlow: 'rgba(255, 138, 128, 0.35)',
    edge: '#5b6472',
    pathEdge: '#ff8a65',
    edgeLabelBg: 'rgba(23, 26, 32, 0.85)',
    edgeLabelText: '#a6adba',
    legendBg: 'rgba(23, 26, 32, 0.9)',
    legendDivider: '#333a46',
    pathStart: '#5fd99b',
    pathMid: '#f0b429',
    pathEnd: '#ff8a80',
    pathLabel: '#0e1014',
  },
};

export function useGraphPalette() {
  const { resolvedTheme } = useTheme();
  return GRAPH_PALETTE[resolvedTheme] || GRAPH_PALETTE.light;
}
