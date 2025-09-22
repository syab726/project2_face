'use client';

import React, { useState, useEffect } from 'react';
import type { RefundableError } from '@/services/refundTrackingService';

interface RefundStatistics {
  totalErrors: number;
  eligibleForRefund: number;
  pendingRefunds: number;
  completedRefunds: number;
  rejectedRefunds: number;
  totalRefundAmount: number;
  refundsByService: { [serviceType: string]: number };
}

interface RefundManagementData {
  errors: RefundableError[];
  total: number;
  statistics: RefundStatistics;
  summary: {
    refundRate: number;
    averageRefundAmount: number;
    pendingRefunds: number;
    eligibilityRate: number;
  };
}

export default function RefundManagement() {
  const [data, setData] = useState<RefundManagementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expandedError, setExpandedError] = useState<string | null>(null);

  const fetchRefundData = async () => {
    try {
      setLoading(true);
      
      // 환불 목록과 통계를 동시에 가져오기
      const [errorsResponse, statsResponse] = await Promise.all([
        fetch(`/api/admin/refund-management?action=list${filter !== 'all' ? `&status=${filter}` : ''}`),
        fetch('/api/admin/refund-management?action=statistics')
      ]);

      const errorsResult = await errorsResponse.json();
      const statsResult = await statsResponse.json();

      if (errorsResult.success && statsResult.success) {
        setData({
          errors: errorsResult.data.errors,
          total: errorsResult.data.total,
          statistics: statsResult.data.statistics,
          summary: statsResult.data.summary
        });
      }
    } catch (error) {
      console.error('환불 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefundData();
    const interval = setInterval(fetchRefundData, 30000); // 30초마다 새로고침
    return () => clearInterval(interval);
  }, [filter]);

  const handleStatusUpdate = async (errorId: string, newStatus: string, notes?: string) => {
    try {
      const response = await fetch('/api/admin/refund-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          errorId,
          status: newStatus,
          notes
        })
      });

      const result = await response.json();
      if (result.success) {
        await fetchRefundData(); // 데이터 새로고침
        alert('환불 상태가 업데이트되었습니다.');
      } else {
        alert('상태 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('환불 상태 업데이트 오류:', error);
      alert('상태 업데이트 중 오류가 발생했습니다.');
    }
  };

  const handleApproveRefund = async (errorId: string, notes?: string) => {
    try {
      const response = await fetch('/api/admin/refund-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve_manual_refund',
          errorId,
          notes
        })
      });

      const result = await response.json();
      if (result.success) {
        await fetchRefundData();
        alert('환불이 승인되었습니다.');
      } else {
        alert('환불 승인에 실패했습니다.');
      }
    } catch (error) {
      console.error('환불 승인 오류:', error);
      alert('환불 승인 중 오류가 발생했습니다.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '대기중';
      case 'processing': return '처리중';
      case 'completed': return '완료';
      case 'rejected': return '거부됨';
      case 'not_required': return '환불불필요';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">환불 데이터 로딩 중...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-gray-600 p-8">
        환불 데이터를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 환불 통계 대시보드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">총 오류</div>
          <div className="text-2xl font-bold text-blue-600">{data.statistics.totalErrors}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">환불 대기</div>
          <div className="text-2xl font-bold text-yellow-600">{data.statistics.pendingRefunds}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">환불 완료</div>
          <div className="text-2xl font-bold text-green-600">{data.statistics.completedRefunds}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">총 환불액</div>
          <div className="text-2xl font-bold text-purple-600">
            {data.statistics.totalRefundAmount.toLocaleString()}원
          </div>
        </div>
      </div>

      {/* 환불율 및 평균 환불액 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">환불율</div>
          <div className="text-lg font-semibold">{data.summary.refundRate}%</div>
          <div className="text-xs text-gray-500">
            환불자격: {data.summary.eligibilityRate}%
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">평균 환불액</div>
          <div className="text-lg font-semibold">
            {data.summary.averageRefundAmount.toLocaleString()}원
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex space-x-2">
        {['all', 'pending', 'processing', 'completed', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? '전체' : getStatusText(status)}
          </button>
        ))}
      </div>

      {/* 환불 대상 오류 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">환불 대상 오류 ({data.total}개)</h3>
        </div>
        
        {data.errors.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            환불 대상 오류가 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {data.errors.map((error) => (
              <div key={error.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium">{error.serviceType}</span>
                      <span className={`px-2 py-1 text-xs rounded ${getStatusColor(error.refundStatus.status)}`}>
                        {getStatusText(error.refundStatus.status)}
                      </span>
                      {error.refundStatus.isEligible && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          환불가능
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-1">
                      <strong>오류:</strong> {error.errorType} - {error.errorMessage}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-1">
                      <strong>발생시간:</strong> {new Date(error.timestamp).toLocaleString('ko-KR')}
                    </div>
                    
                    {error.paymentInfo && (
                      <div className="text-sm text-gray-600 mb-1">
                        <strong>결제정보:</strong> {error.paymentInfo.amount?.toLocaleString()}원 
                        ({error.paymentInfo.paymentMethod}) - {error.paymentInfo.paymentStatus}
                      </div>
                    )}
                    
                    {error.refundStatus.refundAmount && (
                      <div className="text-sm text-gray-600 mb-1">
                        <strong>환불예정액:</strong> {error.refundStatus.refundAmount.toLocaleString()}원
                      </div>
                    )}

                    {error.userInfo.phone && (
                      <div className="text-sm text-gray-600">
                        <strong>연락처:</strong> {error.userInfo.phone}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setExpandedError(expandedError === error.id ? null : error.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {expandedError === error.id ? '접기' : '상세보기'}
                    </button>
                    
                    {error.refundStatus.status === 'pending' && error.refundStatus.isEligible && (
                      <button
                        onClick={() => handleApproveRefund(error.id, '관리자 수동 승인')}
                        className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700"
                      >
                        환불승인
                      </button>
                    )}
                    
                    {error.refundStatus.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(error.id, 'rejected', '관리자 수동 거부')}
                        className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700"
                      >
                        거부
                      </button>
                    )}
                  </div>
                </div>

                {/* 상세 정보 */}
                {expandedError === error.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50 p-3 rounded">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>세션 ID:</strong> {error.sessionId}
                      </div>
                      <div>
                        <strong>API 엔드포인트:</strong> {error.errorContext.apiEndpoint}
                      </div>
                      <div>
                        <strong>중요도:</strong> {error.errorContext.isCritical ? '높음' : '낮음'}
                      </div>
                      <div>
                        <strong>사용자 IP:</strong> {error.userInfo.ip || 'N/A'}
                      </div>
                    </div>
                    
                    {error.refundStatus.notes && (
                      <div className="mt-2">
                        <strong>처리 노트:</strong> {error.refundStatus.notes}
                      </div>
                    )}
                    
                    {error.refundStatus.processedAt && (
                      <div className="mt-2">
                        <strong>처리 시간:</strong> {new Date(error.refundStatus.processedAt).toLocaleString('ko-KR')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}