'use client';
import { PaginatedTable } from '@/shared/ui/PaginatedTable';
import Link from 'next/link';

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/shared/ui'
import { apiClient } from '@/shared/api/api-client'

type ReportData = {
  domain: { id: string; code: string; name: string; description: string }
  stats: {
    totalLearners: number
    avgScore: number
    passRate: number
    totalLessons: number
    totalExams: number
    totalVocab: number
    topCertGoal: { name: string; percent: number } | null
  }
  learners: Array<{
    id: string
    displayName: string
    email: string
    avatarUrl: string | null
    level: string
    certGoal: string | null
    avgCompletion: number
    examCount: number
    passedExams: number
    lastActive: string
  }>
}

export default function ReportDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await apiClient.get<ReportData>(`/reports/domain/${id}`)
        setData(response)
      } catch (err: any) {
        console.error('Failed to fetch report data:', err)
        setError('Không thể tải dữ liệu báo cáo. Vui lòng thử lại.')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id])

  if (loading) {
    return (
      <div className="p-6">
        <PageHeader title="Đang tải báo cáo..." description="Vui lòng chờ trong khi hệ thống tải dữ liệu." />
        <div className="mt-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <PageHeader title="Không thể tải báo cáo" description={error || 'Không tìm thấy báo cáo.'} />
      </div>
    )
  }

  return (
    <div className="p-6"><Link href="/admin/reports" className="mb-4 inline-flex items-center gap-2 rounded-lg py-2 text-sm font-semibold text-primary hover:underline"><span aria-hidden="true">←</span>Quay lại</Link>
      <PageHeader 
        title={data.domain.name} 
        description={data.domain.description || 'Domain Performance Report'} 
      />

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Learners</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.stats.totalLearners}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Average Score</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.stats.avgScore}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Pass Rate</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.stats.passRate}%</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Top Certification Goal</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {data.stats.topCertGoal ? `${data.stats.topCertGoal.name} (${data.stats.topCertGoal.percent}%)` : 'N/A'}
            </dd>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <PaginatedTable enabled={data.learners.length > 0}><table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Học viên
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trình độ
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mục tiêu chứng chỉ
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiến độ trung bình
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bài thi (Đạt/Tổng)
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hoạt động gần nhất
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.learners.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        No learners found.
                      </td>
                    </tr>
                  ) : (
                    data.learners.map((learner) => (
                      <tr key={learner.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {learner.avatarUrl && (
                              <div className="flex-shrink-0 h-10 w-10 mr-3">
                                <img className="h-10 w-10 rounded-full" src={learner.avatarUrl} alt="" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{learner.displayName}</div>
                              <div className="text-sm text-gray-500">{learner.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {learner.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {learner.certGoal || 'None'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {learner.avgCompletion}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {learner.passedExams} / {learner.examCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(learner.lastActive).toLocaleDateString('vi-VN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table></PaginatedTable>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
