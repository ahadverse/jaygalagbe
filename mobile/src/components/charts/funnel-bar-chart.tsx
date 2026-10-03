import { BarChart } from 'react-native-gifted-charts';

import { radius } from '../../theme/tokens';
import { chartAxisTextStyle, chartRuleColor, chartSeries } from './palette';

export type FunnelStage = {
  label: string;
  value: number;
};

// Web cycles brandSoft -> brand -> accent across the stages, and the funnel is
// always Impressions -> Visits -> Leads, so the cycle lands on the series
// colors those three carry everywhere else.
const STAGE_COLORS = [
  chartSeries.impressions,
  chartSeries.visits,
  chartSeries.leads,
];

// Web lays the bars out horizontally to fit long stage labels; at phone width
// the three stage names fit under vertical bars, which keeps the value scale
// readable.
export function FunnelBarChart({ stages }: { stages: FunnelStage[] }) {
  return (
    <BarChart
      data={stages.map((stage, index) => ({
        value: stage.value,
        label: stage.label,
        frontColor: STAGE_COLORS[index % STAGE_COLORS.length],
      }))}
      height={160}
      barBorderRadius={radius.xs}
      rulesColor={chartRuleColor}
      yAxisColor={chartRuleColor}
      xAxisColor={chartRuleColor}
      yAxisTextStyle={chartAxisTextStyle}
      xAxisLabelTextStyle={chartAxisTextStyle}
    />
  );
}
