const supabase = require('../config/supabase');

/**
 * Melaporkan postingan tertentu
 */
const createReport = async (userId, postId, reason, description) => {
  const { data: newReport, error } = await supabase
    .from('reports')
    .insert([
      { reporter_id: userId, post_id: postId, reason, description }
    ])
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return newReport;
};

/**
 * Mengambil semua daftar laporan (Admin Only)
 */
const getReports = async () => {
  const { data: reports, error } = await supabase
    .from('reports')
    .select('*, reporter:users!reporter_id(name, email), post:posts!post_id(title, user_id)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return reports;
};

/**
 * Mengupdate status laporan (Admin Only)
 */
const updateReportStatus = async (reportId, status) => {
  const { data: updatedReport, error } = await supabase
    .from('reports')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', reportId)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return updatedReport;
};

module.exports = {
  createReport,
  getReports,
  updateReportStatus,
};
