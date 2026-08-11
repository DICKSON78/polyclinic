import React from "react";
import KPIReportCardTable from "./KPIReportCardTable";
import { useFetch } from "../../hooks";
import { Box, Typography, Card, CardContent, Paper } from "@mui/material";
import { Assessment as ReportIcon } from "@mui/icons-material";

const OptometryDepartmentReportCard = ({ dateParams = {} }) => {
  // Use provided dateParams or default to current month (MTD) - FIXED!
  const [refreshKey, setRefreshKey] = React.useState(0);

  const effectiveDateParams = (dateParams && dateParams.start_date && dateParams.end_date) ? dateParams : {
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  };
  
  console.log('=== OPTOMETRY REPORT CARD - DATE FIX ===');
  console.log('Date params received:', dateParams);
  console.log('Effective date params:', effectiveDateParams);
  
  // Fetch performance data from backend (includes all medicines + targets + results)
  const { data: performanceData, loading: performanceLoading, error: performanceError, handleFetch: refetchData } = useFetch(
    "api/performance-reports/optometry",
    { ...effectiveDateParams, _refresh: refreshKey },
    true,
    null,
    (response) => {
      console.log('API Response received:', response);
      if (!response || !response.data || !response.data.data) {
        console.error('Invalid API response structure:', response);
        return null;
      }
      return response.data.data;
    }
  );

  // Transform backend KPI data to table format - memoized to prevent re-renders
  const transformToKPIs = React.useCallback((data) => {
    console.log('Transforming KPIs, input data:', data);
    
    if (!data?.kpis) {
      console.log('No KPIs found in data');
      return [];
    }
    
    console.log('KPIs array found:', data.kpis);
    
    // Filter for medicines only (ignore the special multi-KPIs like grand totals or return %)
    const specialIds = ['medicine_sales', 'softdrop_sales', 'return_patient_percentage'];
    
    const filteredKPIs = data.kpis.filter(kpi => !specialIds.includes(kpi.id));
    console.log('Filtered KPIs (medicines only):', filteredKPIs);
    
    const transformedKPIs = filteredKPIs.map(kpi => {
      const sold = kpi.result || 0;
      const target = kpi.target || 0;
      const progressPercentage = target > 0 ? Math.min((sold / target) * 100, 100) : 0;
      
      console.log(`Processing ${kpi.name}: sold=${sold}, target=${target}, percentage=${progressPercentage}%`);
      
      let status;
      if (sold === 0) status = 'default';
      else if (progressPercentage >= 75) status = 'success';
      else if (progressPercentage >= 50) status = 'warning';
      else status = 'error';
      
      const transformed = {
        description: kpi.name,
        target: kpi.formatted_target || `${target.toLocaleString()} units`,
        results: kpi.formatted_result || `${sold.toLocaleString()} units`,
        status: status,
        _r: sold,
        _t: target
      };
      
      console.log(`Transformed ${kpi.name}:`, transformed);
      return transformed;
    });
    
    console.log('Final transformed KPIs:', transformedKPIs);
    return transformedKPIs;
  }, []);

  // Memoize the transformed KPIs to prevent unnecessary re-transformations
  const finalKPIs = React.useMemo(() => {
    return transformToKPIs(performanceData);
  }, [performanceData, transformToKPIs]);

  // Log for debugging
  React.useEffect(() => {
    console.log('OptometryDepartmentReportCard - Performance Data:', performanceData);
    console.log('OptometryDepartmentReportCard - Loading:', performanceLoading);
    console.log('OptometryDepartmentReportCard - Error:', performanceError);
    console.log('OptometryDepartmentReportCard - Final KPIs:', finalKPIs);
  }, [performanceData, performanceLoading, performanceError, finalKPIs]);

  // Show error state
  if (performanceError) {
    return (
      <div style={{ padding: 20, color: 'red' }}>
        <h3>Error loading examination data</h3>
        <p>{JSON.stringify(performanceError)}</p>
      </div>
    );
  }

  return (
    <>
      {/* Performance Summary Card */}
      {performanceData?.summary && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <ReportIcon sx={{ color: '#1976d2', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                Performance Summary
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              {performanceData.summary}
            </Typography>
          </CardContent>
        </Card>
      )}

      <KPIReportCardTable 
        title="EXAMINATION DEPARTMENT REPORT CARD" 
        kpis={finalKPIs} 
        loading={performanceLoading} 
        canEdit={true}
        department="optometry"
        date={effectiveDateParams.start_date}
        onRefresh={() => setRefreshKey(k => k + 1)}
        recommendations={performanceData?.recommendations || ""}
      />
    </>
  );
};

export default OptometryDepartmentReportCard;
