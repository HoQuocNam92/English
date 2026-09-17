'use client'

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
        setError('Failed to load report data.')
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
        <PageHeader title="Loading Report..." description="Please wait while we fetch the data." />
        <div className="mt-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <PageHeader title="Error" description={error || 'Report not found'} />
      </div>
    )
  }

  return (
    <div className="p-6">
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
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Learner
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cert Goal
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Completion
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exams (Passed/Total)
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Active
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
                          {new Date(learner.lastActive).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}