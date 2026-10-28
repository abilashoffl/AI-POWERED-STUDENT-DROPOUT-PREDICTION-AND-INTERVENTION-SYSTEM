import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../services/studentService';
import RiskBadge from '../components/RiskBadge';
import StudentModal from '../components/StudentModal';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Edit2,
  Trash2,
  Sparkles,
  BookOpen,
  Calendar
} from 'lucide-react';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [riskLevel, setRiskLevel] = useState('All');
  const [year, setYear] = useState('All');
  const [sortBy, setSortBy] = useState('currentRiskScore');
  const [sortOrder, setSortOrder] = useState('desc');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, [search, department, riskLevel, year, sortBy, sortOrder]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await getStudents({
        search,
        department,
        riskLevel,
        year,
        sortBy,
        sortOrder
      });
      setStudents(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleOpenAddModal = () => {
    setSelectedStudent(null);
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setSelectedStudent(student);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    if (isEdit && selectedStudent) {
      await updateStudent(selectedStudent._id, formData);
    } else {
      await createStudent(formData);
    }
    fetchStudents();
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete student ${name}? This will remove all associated predictions and intervention records.`)) {
      try {
        await deleteStudent(id);
        fetchStudents();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Student Academic Roster</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage student academic metrics, attendance records, and risk profiles
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Enroll New Student
        </button>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Name, Student ID, or Email..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filter Department */}
        <div>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Tech">Information Tech</option>
            <option value="Electronics & Comm">Electronics & Comm</option>
            <option value="Mechanical Eng">Mechanical Eng</option>
            <option value="Civil Eng">Civil Eng</option>
          </select>
        </div>

        {/* Filter Risk Level */}
        <div>
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Risk Levels</option>
            <option value="HIGH">HIGH Risk (70-100%)</option>
            <option value="MEDIUM">MEDIUM Risk (40-69%)</option>
            <option value="LOW">LOW Risk (0-39%)</option>
          </select>
        </div>

        {/* Filter Year */}
        <div>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
      </div>

      {/* Student Table */}
      {loading ? (
        <LoadingSpinner label="Fetching student database..." />
      ) : students.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-3">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Student Records Found</h3>
          <p className="text-xs text-slate-400">Try adjusting your search criteria or enroll a new student.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-850/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Department & Year</th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => toggleSort('attendance')}>
                    <div className="flex items-center gap-1">
                      Attendance
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => toggleSort('currentGpa')}>
                    <div className="flex items-center gap-1">
                      Current GPA
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => toggleSort('backlogs')}>
                    <div className="flex items-center gap-1">
                      Backlogs
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => toggleSort('currentRiskScore')}>
                    <div className="flex items-center gap-1">
                      AI Dropout Risk
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{student.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{student.studentId} • {student.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-300 font-semibold">{student.department}</div>
                      <div className="text-[11px] text-slate-500">Year {student.year} (Sec {student.section})</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{student.attendance}%</div>
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className={`h-full ${student.attendance < 65 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${student.attendance}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-200">{student.currentGpa.toFixed(1)}</span>
                      <span className="text-[11px] text-slate-500"> / 10</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {student.backlogs > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[11px] border border-rose-500/30">
                          {student.backlogs} Backlog{student.backlogs > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={student.currentRiskLevel} score={student.currentRiskScore} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/admin/students/${student.studentId}`)}
                          className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                          title="View Profile & Risk Factors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(student)}
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                          title="Edit Student Data"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student._id, student.name)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Add/Edit Modal */}
      <StudentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedStudent}
        isEdit={isEdit}
      />
    </div>
  );
};

export default StudentList;
