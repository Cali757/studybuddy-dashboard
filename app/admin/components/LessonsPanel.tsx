'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Lesson {
  id: string;
  title: string;
  source: string;
  status: string;
  lastUpdated: any;
  userId?: string;
  createdAt?: any;
}

export default function LessonsPanel() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingLesson, setProcessingLesson] = useState<string | null>(null);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const lessonsRef = collection(db, 'lessons');
      const q = query(lessonsRef, orderBy('lastUpdated', 'desc'));
      const snapshot = await getDocs(q);
      
      const lessonsData: Lesson[] = [];
      snapshot.forEach((doc) => {
        lessonsData.push({
          id: doc.id,
          ...doc.data()
        } as Lesson);
      });
      
      setLessons(lessonsData);
    } catch (err: any) {
      console.error('Error fetching lessons:', err);
      setError(err.message || 'Failed to fetch lessons');
    } finally {
      setLoading(false);
    }
  };

  const reprocessLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to reprocess this lesson? This will regenerate the summary and embeddings.')) {
      return;
    }
    
    try {
      setProcessingLesson(lessonId);
      const lessonRef = doc(db, 'lessons', lessonId);
      
      // Update status to trigger reprocessing
      await updateDoc(lessonRef, {
        status: 'pending',
        lastUpdated: new Date()
      });
      
      alert('Lesson marked for reprocessing. The Cloud Function will handle it shortly.');
      fetchLessons(); // Refresh the list
    } catch (err: any) {
      console.error('Error reprocessing lesson:', err);
      alert('Failed to reprocess lesson: ' + err.message);
    } finally {
      setProcessingLesson(null);
    }
  };

  const deleteLesson = async (lessonId: string, lessonTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${lessonTitle}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'lessons', lessonId));
      alert('Lesson deleted successfully');
      fetchLessons(); // Refresh the list
    } catch (err: any) {
      console.error('Error deleting lesson:', err);
      alert('Failed to delete lesson: ' + err.message);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleString();
      }
      if (timestamp instanceof Date) {
        return timestamp.toLocaleString();
      }
      if (typeof timestamp === 'number') {
        return new Date(timestamp).toLocaleString();
      }
      return 'N/A';
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'complete':
        return 'bg-green-600/20 text-green-300';
      case 'processing':
      case 'pending':
        return 'bg-yellow-600/20 text-yellow-300';
      case 'failed':
      case 'error':
        return 'bg-red-600/20 text-red-300';
      default:
        return 'bg-gray-600/20 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading lessons...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Lessons ({lessons.length})</h2>
        <button
          onClick={fetchLessons}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Total Lessons</div>
          <div className="text-2xl font-bold text-white">{lessons.length}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Completed</div>
          <div className="text-2xl font-bold text-green-400">
            {lessons.filter(l => l.status?.toLowerCase() === 'completed' || l.status?.toLowerCase() === 'complete').length}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Processing</div>
          <div className="text-2xl font-bold text-yellow-400">
            {lessons.filter(l => l.status?.toLowerCase() === 'processing' || l.status?.toLowerCase() === 'pending').length}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Failed</div>
          <div className="text-2xl font-bold text-red-400">
            {lessons.filter(l => l.status?.toLowerCase() === 'failed' || l.status?.toLowerCase() === 'error').length}
          </div>
        </div>
      </div>

      {/* Lessons Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-3 text-gray-300 font-medium">Title</th>
              <th className="text-left p-3 text-gray-300 font-medium">Source</th>
              <th className="text-left p-3 text-gray-300 font-medium">Status</th>
              <th className="text-left p-3 text-gray-300 font-medium">Last Updated</th>
              <th className="text-left p-3 text-gray-300 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => (
              <tr key={lesson.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="p-3 text-gray-200 max-w-xs truncate">
                  {lesson.title || 'Untitled'}
                </td>
                <td className="p-3 text-gray-400 text-sm">
                  {lesson.source === 'google_drive' ? '📁 Google Drive' : 
                   lesson.source === 'upload' ? '📤 Upload' : 
                   lesson.source || 'Unknown'}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(lesson.status)}`}>
                    {lesson.status || 'unknown'}
                  </span>
                </td>
                <td className="p-3 text-gray-400 text-sm">{formatDate(lesson.lastUpdated)}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => reprocessLesson(lesson.id)}
                      disabled={processingLesson === lesson.id}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
                    >
                      {processingLesson === lesson.id ? 'Processing...' : 'Reprocess'}
                    </button>
                    <button
                      onClick={() => deleteLesson(lesson.id, lesson.title)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {lessons.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No lessons found
        </div>
      )}

      {/* Info Note */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-blue-400 text-xl">ℹ️</span>
          <div>
            <div className="text-blue-200 font-medium mb-1">Lesson Management</div>
            <div className="text-blue-300/80 text-sm">
              Reprocessing a lesson will regenerate its summary and embeddings. This is useful if the AI processing failed or if you want to update the content with improved algorithms.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
