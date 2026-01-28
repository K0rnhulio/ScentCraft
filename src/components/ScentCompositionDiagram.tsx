import { motion } from 'framer-motion';
import type { ScentComponent } from '../services/aiService';

interface ScentCompositionDiagramProps {
  components: ScentComponent[];
}

export const ScentCompositionDiagram = ({ components }: ScentCompositionDiagramProps) => {
  // Sort components by percentage (largest first)
  const sortedComponents = [...components].sort((a, b) => b.percentage - a.percentage);
  
  // Calculate cumulative heights for stacking
  let cumulativeHeight = 0;
  const layers = sortedComponents.map((component) => {
    const height = component.percentage;
    const startY = cumulativeHeight;
    cumulativeHeight += height;
    return { ...component, height, startY };
  });

  return (
    <div className="w-full">
      {/* Diagram Container */}
      <div className="relative bg-gradient-to-b from-neutral-50 to-white rounded-3xl p-8 sm:p-10 overflow-hidden">
        {/* Title */}
        <h3 className="text-lg font-medium mb-8 text-neutral-500 uppercase tracking-wider text-center">
          Your personal Scent Composition:
        </h3>

        {/* Visual Diagram */}
        <div className="flex flex-col sm:flex-row gap-8 items-center">
          {/* Left: Circular Diagram */}
          <div className="w-full sm:w-1/2 flex justify-center">
            <div className="relative w-64 h-64">
              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                {/* Create donut chart segments */}
                {(() => {
                  let currentAngle = 0;
                  return layers.map((layer, idx) => {
                    const colors = [
                      { from: '#10b981', to: '#34d399' }, // Emerald
                      { from: '#f59e0b', to: '#fbbf24' }, // Amber
                      { from: '#7c3aed', to: '#a78bfa' }, // Purple
                    ];
                    const color = colors[idx] || colors[0];
                    
                    const percentage = layer.percentage;
                    const angle = (percentage / 100) * 360;
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + angle;
                    
                    // Convert to radians
                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;
                    
                    // Donut chart parameters
                    const centerX = 100;
                    const centerY = 100;
                    const outerRadius = 85;
                    const innerRadius = 50;
                    
                    // Calculate arc points
                    const x1 = centerX + outerRadius * Math.cos(startRad);
                    const y1 = centerY + outerRadius * Math.sin(startRad);
                    const x2 = centerX + outerRadius * Math.cos(endRad);
                    const y2 = centerY + outerRadius * Math.sin(endRad);
                    const x3 = centerX + innerRadius * Math.cos(endRad);
                    const y3 = centerY + innerRadius * Math.sin(endRad);
                    const x4 = centerX + innerRadius * Math.cos(startRad);
                    const y4 = centerY + innerRadius * Math.sin(startRad);
                    
                    const largeArc = angle > 180 ? 1 : 0;
                    
                    const pathData = [
                      `M ${x1} ${y1}`,
                      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
                      `L ${x3} ${y3}`,
                      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
                      'Z'
                    ].join(' ');
                    
                    currentAngle = endAngle;
                    
                    return (
                      <g key={idx}>
                        <defs>
                          <linearGradient id={`circleGradient${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={color.from} />
                            <stop offset="100%" stopColor={color.to} />
                          </linearGradient>
                        </defs>
                        <motion.path
                          d={pathData}
                          fill={`url(#circleGradient${idx})`}
                          stroke="white"
                          strokeWidth="2"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ 
                            duration: 0.6, 
                            delay: idx * 0.15,
                            ease: "easeOut"
                          }}
                        />
                      </g>
                    );
                  });
                })()}
                
                {/* Center circle */}
                <circle cx="100" cy="100" r="48" fill="white" />
              </svg>
              
              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-black">100%</div>
                  <div className="text-sm text-neutral-500 mt-1">Perfect Blend</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Layer Breakdown */}
          <div className="w-full sm:w-1/2 space-y-4">
            {layers.map((layer, idx) => (
              <motion.div
                key={idx}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + idx * 0.15 }}
                className="flex items-center gap-4"
              >
                {/* Color Indicator */}
                <div 
                  className="w-12 h-12 rounded-xl flex-shrink-0 shadow-sm"
                  style={{
                    background: idx === 0 
                      ? 'linear-gradient(135deg, #10b981, #34d399)'
                      : idx === 1
                      ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
                      : 'linear-gradient(135deg, #7c3aed, #a78bfa)'
                  }}
                />
                
                {/* Layer Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="text-xs text-neutral-400 font-medium mb-1">#{layer.item_id}</p>
                      <span className="font-semibold text-black">{layer.name}</span>
                    </div>
                    <span className="text-2xl font-bold text-black">{layer.percentage}%</span>
                  </div>
                  <p className="text-sm text-neutral-500">{layer.reason}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Legend */}
        <div className="mt-8 pt-6 border-t border-neutral-200">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-violet-600 to-violet-400" />
              <span className="text-neutral-600">Base Notes (Foundation)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-amber-500 to-amber-300" />
              <span className="text-neutral-600">Heart Notes (Character)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-emerald-500 to-emerald-300" />
              <span className="text-neutral-600">Top Notes (Accent)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
