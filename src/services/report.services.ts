import { ObjectId } from 'mongodb'
import omitBy from 'lodash/omitBy'
import isUndefined from 'lodash/isUndefined'

import { ReportStatus } from '~/constants/enum'
import { GetReportsReqQuery, SendReportReqBody } from '~/models/requests/Report.requests'
import Report from '~/models/schemas/Report.schema'
import databaseService from './database.services'

class ReportService {
  // Gửi báo cáo
  async sendReport({ body, accountId }: { body: SendReportReqBody; accountId: string }) {
    const { content, contentId, contentType } = body
    const { insertedId } = await databaseService.reports.insertOne(
      new Report({
        content,
        contentType,
        contentId: new ObjectId(contentId),
        accountId: new ObjectId(accountId)
      })
    )
    const newReport = await databaseService.reports.findOne({ _id: insertedId })
    return {
      report: newReport
    }
  }

  // Cập nhật trạng thái báo cáo (admin)
  async updateReportStatus({ status, reportId }: { status: ReportStatus; reportId: string }) {
    const updatedReport = await databaseService.reports.findOneAndUpdate(
      {
        _id: new ObjectId(reportId)
      },
      {
        $set: {
          status
        },
        $currentDate: {
          updatedAt: true
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return {
      report: updatedReport
    }
  }

  // Xóa báo cáo (admin)
  async deleteReports(reportIds: string[]) {
    const _reportIds = reportIds.map((reportId) => new ObjectId(reportId))
    const { deletedCount } = await databaseService.reports.deleteMany({
      _id: {
        $in: _reportIds
      }
    })
    return {
      deletedCount
    }
  }

  // Lấy danh sách báo cáo (admin)
  async getReports(query: GetReportsReqQuery) {
    const { page, limit, status } = query
    const _page = Number(page) || 1
    const _limit = Number(limit) || 20
    const skip = (_page - 1) * _limit
    const match = omitBy(
      {
        status
      },
      isUndefined
    )
    const [reports, totalRows] = await Promise.all([
      databaseService.reports
        .aggregate([
          {
            $match: match
          },
          {
            $lookup: {
              from: 'accounts',
              localField: 'accountId',
              foreignField: '_id',
              as: 'author'
            }
          },
          {
            $unwind: {
              path: '$author'
            }
          },
          {
            $group: {
              _id: '$_id',
              author: {
                $first: '$author'
              },
              content: {
                $first: '$content'
              },
              contentType: {
                $first: '$contentType'
              },
              status: {
                $first: '$status'
              },
              createdAt: {
                $first: '$createdAt'
              },
              updatedAt: {
                $first: '$updatedAt'
              }
            }
          },
          {
            $project: {
              'author.email': 0,
              'author.password': 0,
              'author.bio': 0,
              'author.avatar': 0,
              'author.cover': 0,
              'author.tick': 0,
              'author.role': 0,
              'author.status': 0,
              'author.verify': 0,
              'author.forgotPasswordToken': 0,
              'author.verifyEmailToken': 0
            }
          },
          {
            $skip: skip
          },
          {
            $limit: _limit
          }
        ])
        .toArray(),
      databaseService.reports.countDocuments(match)
    ])
    return {
      reports,
      page: _page,
      limit: _limit,
      totalRows,
      totalPages: Math.ceil(totalRows / _limit)
    }
  }
}

const reportService = new ReportService()
export default reportService
