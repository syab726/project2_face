'use client';

import { useState, useEffect } from 'react';

interface BackupFile {
  type: string;
  filename: string;
  size: number;
  created: Date;
}

interface BackupConfig {
  enabled: boolean;
  retention: {
    database: number;
    logs: number;
    files: number;
  };
  schedule: {
    database: string;
    logs: string;
    files: string;
  };
}

interface BackupResult {
  success: boolean;
  type: string;
  filename: string;
  size: number;
  duration: number;
  timestamp: string;
  error?: string;
}

export default function AdminBackup() {
  const [backupHistory, setBackupHistory] = useState<BackupFile[]>([]);
  const [config, setConfig] = useState<BackupConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadBackupData();
  }, [selectedType]);

  const loadBackupData = async () => {
    try {
      const params = selectedType !== 'all' ? `?type=${selectedType}` : '';
      const response = await fetch(`/api/admin/backup${params}`);
      const result = await response.json();
      
      if (result.success) {
        setBackupHistory(result.data.history.map((item: any) => ({
          ...item,
          created: new Date(item.created)
        })));
        setConfig(result.data.config);
      }
    } catch (error) {
      console.error('Failed to load backup data:', error);
    } finally {
      setLoading(false);
    }
  };

  const performBackup = async (type: string) => {
    setOperationLoading(true);
    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`${type} 백업이 완료되었습니다.`);
        loadBackupData();
      } else {
        alert(`백업 실패: ${result.error}`);
      }
    } catch (error) {
      alert('백업 중 오류가 발생했습니다.');
      console.error('Backup error:', error);
    } finally {
      setOperationLoading(false);
    }
  };

  const cleanupBackups = async () => {
    if (!confirm('오래된 백업 파일들을 정리하시겠습니까?')) {
      return;
    }

    setOperationLoading(true);
    try {
      const response = await fetch('/api/admin/backup/cleanup', {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('백업 정리가 완료되었습니다.');
        loadBackupData();
      } else {
        alert(`정리 실패: ${result.error}`);
      }
    } catch (error) {
      alert('정리 중 오류가 발생했습니다.');
      console.error('Cleanup error:', error);
    } finally {
      setOperationLoading(false);
    }
  };

  const restoreDatabase = async (filename: string) => {
    if (!confirm(`데이터베이스를 ${filename}으로 복원하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    setOperationLoading(true);
    try {
      const response = await fetch('/api/admin/backup/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('데이터베이스 복원이 완료되었습니다.');
      } else {
        alert(`복원 실패: ${result.error}`);
      }
    } catch (error) {
      alert('복원 중 오류가 발생했습니다.');
      console.error('Restore error:', error);
    } finally {
      setOperationLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'database': return 'bg-blue-100 text-blue-800';
      case 'logs': return 'bg-green-100 text-green-800';
      case 'files': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'database': return '🗄️';
      case 'logs': return '📝';
      case 'files': return '📁';
      default: return '📦';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">백업 관리</h2>
        
        {/* 백업 설정 정보 */}
        {config && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">백업 설정</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-blue-800"><strong>상태:</strong> {config.enabled ? '활성화' : '비활성화'}</p>
              </div>
              <div>
                <p className="text-blue-800"><strong>보관 기간:</strong></p>
                <ul className="text-blue-700 ml-4">
                  <li>DB: {config.retention.database}일</li>
                  <li>로그: {config.retention.logs}일</li>
                  <li>파일: {config.retention.files}일</li>
                </ul>
              </div>
              <div>
                <p className="text-blue-800"><strong>스케줄:</strong></p>
                <ul className="text-blue-700 ml-4">
                  <li>DB: {config.schedule.database}</li>
                  <li>로그: {config.schedule.logs}</li>
                  <li>파일: {config.schedule.files}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 백업 실행 버튼들 */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => performBackup('database')}
            disabled={operationLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🗄️ DB 백업
          </button>
          <button
            onClick={() => performBackup('logs')}
            disabled={operationLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📝 로그 백업
          </button>
          <button
            onClick={() => performBackup('files')}
            disabled={operationLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📁 파일 백업
          </button>
          <button
            onClick={() => performBackup('full')}
            disabled={operationLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📦 전체 백업
          </button>
          <button
            onClick={cleanupBackups}
            disabled={operationLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed ml-4"
          >
            🗑️ 정리
          </button>
        </div>

        {/* 필터 */}
        <div className="mb-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">모든 백업</option>
            <option value="database">데이터베이스</option>
            <option value="logs">로그</option>
            <option value="files">파일</option>
          </select>
        </div>
      </div>

      {/* 백업 히스토리 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold text-gray-900">백업 히스토리</h3>
        </div>
        
        {backupHistory.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            백업 파일이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    타입
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    파일명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    크기
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    생성일시
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backupHistory.map((backup, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(backup.type)}`}>
                        {getTypeIcon(backup.type)} {backup.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {backup.filename}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(backup.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {backup.created.toLocaleString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {backup.type === 'database' && (
                        <button
                          onClick={() => restoreDatabase(backup.filename)}
                          disabled={operationLoading}
                          className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          복원
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {operationLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>작업 중...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}