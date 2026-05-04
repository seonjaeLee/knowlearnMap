import React, { useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Maximize2, Network } from 'lucide-react';
import './MiniKnowledgeGraph.css';

const MiniKnowledgeGraph = ({ nodes, links, onExpand }) => {
    const graphRef = useRef();
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 300, height: 300 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };

        const timer = setTimeout(updateDimensions, 100);
        window.addEventListener('resize', updateDimensions);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateDimensions);
        };
    }, []);

    useEffect(() => {
        if (graphRef.current) {
            graphRef.current.d3Force('charge').strength(-120);
            graphRef.current.d3Force('link').distance(60);
            setTimeout(() => graphRef.current.zoomToFit(400, 30), 500);
        }
    }, [nodes, links]);

    const graphData = React.useMemo(() => {
        // Deep clone to ensure we don't mutate props and allow D3 to modify internal state
        // Especially important because we are toggling between Mini and Full view using same data source
        return {
            nodes: nodes.map(n => ({ ...n })),
            links: links.map(l => ({ ...l }))
        };
    }, [nodes, links]);

    return (
        <div className="mini-kg-container" ref={containerRef}>
            <div className="mini-kg-header">
                <div className="mini-kg-title">
                    <Network size={14} />
                    <span>지식 그래프 ({nodes.length})</span>
                </div>
                <button className="mini-kg-expand-btn" onClick={onExpand} title="크게 보기">
                    <Maximize2 size={14} />
                </button>
            </div>

            <div className="mini-kg-canvas">
                <ForceGraph2D
                    ref={graphRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    graphData={graphData}
                    nodeLabel="name"
                    nodeAutoColorBy="group"
                    backgroundColor="#ffffff"
                    enableZoom={true}
                    enablePanInteraction={true}
                    cooldownTicks={100}
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        const label = node.name;
                        const fontSize = 10 / globalScale;
                        ctx.font = `${fontSize}px "Pretendard Variable", sans-serif`;

                        const r = 3 / globalScale;
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                        ctx.fillStyle = node.color || '#9BBFEE';
                        ctx.fill();

                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'top';
                        ctx.fillStyle = '#333';
                        ctx.fillText(label, node.x, node.y + r + 1 / globalScale);
                    }}
                    linkCanvasObject={(link, ctx, globalScale) => {
                        const start = link.source;
                        const end = link.target;

                        if (!start || !end || typeof start !== 'object' || typeof end !== 'object' ||
                            typeof start.x !== 'number' || typeof end.x !== 'number') return;

                        const nodeRadius = 3 / globalScale;
                        const arrowLength = 4 / globalScale;

                        const deltaX = end.x - start.x;
                        const deltaY = end.y - start.y;
                        const angle = Math.atan2(deltaY, deltaX);

                        const tipX = end.x - nodeRadius * Math.cos(angle);
                        const tipY = end.y - nodeRadius * Math.sin(angle);

                        ctx.beginPath();
                        ctx.moveTo(start.x, start.y);
                        ctx.lineTo(tipX, tipY);
                        ctx.strokeStyle = '#999';
                        ctx.lineWidth = 1 / globalScale;
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.moveTo(tipX, tipY);
                        ctx.lineTo(
                            tipX - arrowLength * Math.cos(angle - Math.PI / 6),
                            tipY - arrowLength * Math.sin(angle - Math.PI / 6)
                        );
                        ctx.lineTo(
                            tipX - arrowLength * Math.cos(angle + Math.PI / 6),
                            tipY - arrowLength * Math.sin(angle + Math.PI / 6)
                        );
                        ctx.closePath();
                        ctx.fillStyle = '#999';
                        ctx.fill();

                        // Draw Label
                        if (link.label_ko || link.label_en) {
                            const label = link.label_ko || link.label_en || "";
                            const fontSize = 10 / globalScale;
                            ctx.font = `${fontSize}px "Pretendard Variable", sans-serif`;

                            // Calculate midpoint
                            const textX = start.x + (end.x - start.x) / 2;
                            const textY = start.y + (end.y - start.y) / 2;

                            // Label Background for readability
                            const textWidth = ctx.measureText(label).width;
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                            ctx.fillRect(textX - textWidth / 2 - 2, textY - fontSize / 2 - 2, textWidth + 4, fontSize + 4);

                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillStyle = '#666'; // Darker gray for edge label
                            ctx.fillText(label, textX, textY);
                        }
                    }}
                />
            </div>
            {nodes.length === 0 && (
                <div className="mini-kg-empty">
                    검색 결과가 없습니다
                </div>
            )}
        </div>
    );
};

export default MiniKnowledgeGraph;
