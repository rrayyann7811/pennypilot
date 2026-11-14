import { memo } from 'react';
import IncomeExpenseChart from './IncomeExpenseChart';
import SpendingTrendChart from './SpendingTrendChart';

function AnalyticsCharts({ rows }) {
  return <div className="analytics-charts"><IncomeExpenseChart rows={rows} /><SpendingTrendChart rows={rows} /></div>;
}
export default memo(AnalyticsCharts);
