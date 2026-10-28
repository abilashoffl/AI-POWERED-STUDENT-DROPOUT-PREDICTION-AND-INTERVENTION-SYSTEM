import React, { useState, useEffect } from 'react';
import { getStudents } from '../services/studentService';
import { getInterventions } from '../services/interventionService';
import RiskBadge from '../components/RiskBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { FileSpreadsheet, Download, Printer, Filter } from 'lucide-react';

const Reports = () => {
  const [reportType, setReportType] = useState('high_risk');
  const [students, setStudents] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [sData, iData] = await Promise.all([getStudents(), getInterventions()]);
      setStudents(sData || []);
      setInterventions(iData || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const getFilteredReportData = () => {
    switch (reportType) {
      case 'high_risk':
        return students.filter((s) => s.currentRiskLevel === 'HIGH');
      case 'medium_risk':
        return students.filter((s) => s.currentRiskLevel === 'MEDIUM');
      case 'interventions':
        return interventions;
      case 'all_students':
      default:
        return students;
    }
  };

  const exportCSV = () => {
    const data = getFilteredReportData();
    if (data.length === 0) return alert('No records to export');

    let csvContent = 'data:text/csv;charset=utf-8,';
    if (reportType === 'interventions') {
      csvContent += 'Intervention ID,Student ID,Title,Type,Mentor,Priority,Status,Deadline\n';
      data.forEach((i) => {
        csvContent += `"${i._id}","${i.studentId}","${i.title}","${i.type}","${i.mentorName}","${i.priority}","${i.status}","${new Date(i.deadline).toLocaleDateString()}"\n`;
      });
    } else {
      csvContent += 'Student ID,Name,Email,Department,Year,Attendance %,GPA,Backlogs,Risk Level,Risk Score %\n';
      data.forEach((s) => {
        csvContent += `"${s.studentId}","${s.name}","${s.email}","${s.department}","${s.year}","${s.attendance}","${s.currentGpa}","${s.backlogs}","${s.currentRiskLevel}","${s.currentRiskScore}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EduPredict_Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    window.print();
  };

  if (loading) return <LoadingSpinner label="Generating statistical report table..." />;

  const reportRecords = getFilteredReportData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            Institutional Audit Reports & Data Export
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate printable PDF reports and downloadable CSV data feeds
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={printReport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700"
          >
            <Printer className="w-4 h-4" /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Select Report Type */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3 print:hidden">
        <span className="text-xs font-bold text-slate-300">Select Report View:</span>
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none"
        >
          <option value="high_risk">High-Risk Students Report</option>
          <option value="medium_risk">Medium-Risk Students Report</option>
          <option value="all_students">Complete Student Roster Report</option>
          <option value="interventions">Intervention Progress Report</option>
        </select>
        <span className="text-xs text-slate-400 ml-auto font-semibold">
          {reportRecords.length} Records Match
        </span>
      </div>

      {/* Report Printable Area */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4 print:bg-white print:text-black print:p-0">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white uppercase print:text-black">
              EduPredict AI - {reportType.replace('_', ' ').toUpperCase()}
            </h2>
            <div className="text-xs text-slate-400 print:text-gray-600">
              Generated Date: {new Date().toLocaleDateString()} • System Audit Trail
            </div>
          </div>
        </div>

        {reportRecords.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No data found for this report type.</p>
        ) : reportType === 'interventions' ? (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 print:text-gray-800">
                <th className="py-2.5 px-3">Student ID</th>
                <th className="py-2.5 px-3">Title & Category</th>
                <th className="py-2.5 px-3">Mentor</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
              {reportRecords.map((i) => (
                <tr key={i._id} className="print:text-black">
                  <td className="py-2.5 px-3 font-mono">{i.studentId}</td>
                  <td className="py-2.5 px-3 font-bold">{i.title} <span className="font-normal text-slate-400">({i.type})</span></td>
                  <td className="py-2.5 px-3">{i.mentorName}</td>
                  <td className="py-2.5 px-3">{i.priority}</td>
                  <td className="py-2.5 px-3 font-semibold">{i.status}</td>
                  <td className="py-2.5 px-3">{new Date(i.deadline).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 print:text-gray-800">
                <th className="py-2.5 px-3">Student ID</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Attendance</th>
                <th className="py-2.5 px-3">GPA</th>
                <th className="py-2.5 px-3">Backlogs</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
              {reportRecords.map((s) => (
                <tr key={s._id} className="print:text-black">
                  <td className="py-2.5 px-3 font-mono">{s.studentId}</td>
                  <td className="py-2.5 px-3 font-bold">{s.name}</td>
                  <td className="py-2.5 px-3">{s.department} (Yr {s.year})</td>
                  <td className="py-2.5 px-3">{s.attendance}%</td>
                  <td className="py-2.5 px-3">{s.currentGpa.toFixed(1)}</td>
                  <td className="py-2.5 px-3">{s.backlogs}</td>
                  <td className="py-2.5 px-3 font-bold">{s.currentRiskLevel}</td>
                  <td className="py-2.5 px-3 font-bold">{s.currentRiskScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Reports;
