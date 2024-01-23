import { ObjectId, WithId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import { ReactionType } from '~/constants/enum'
import { CreateCommentReqBody, GetCommentsReqQuery, ReplyCommentReqBody } from '~/models/requests/Comment.requests'
import Comment from '~/models/schemas/Comment.schema'
import databaseService from './database.services'
import { PaginationReqQuery } from '~/models/requests/Common.requests'

class CommentService {
  // Thêm một bình luận
  async createComment({ body, accountId }: { body: CreateCommentReqBody; accountId: string }) {
    const { contentId, content, type } = body
    const { insertedId } = await databaseService.comments.insertOne(
      new Comment({
        accountId: new ObjectId(accountId),
        contentId: new ObjectId(contentId),
        parentId: null,
        content,
        type,
        replyAccountId: null
      })
    )
    const newComment = await databaseService.comments
      .aggregate([
        {
          $match: {
            _id: insertedId
          }
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
          $lookup: {
            from: 'images',
            localField: 'author.avatar',
            foreignField: '_id',
            as: 'authorAvatar'
          }
        },
        {
          $unwind: {
            path: '$authorAvatar',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'comments',
            localField: '_id',
            foreignField: 'parentId',
            as: 'replies'
          }
        },
        {
          $lookup: {
            from: 'reactions',
            localField: '_id',
            foreignField: 'contentId',
            as: 'reactions'
          }
        },
        {
          $addFields: {
            replyCount: {
              $size: '$replies'
            },
            likes: {
              $filter: {
                input: '$reactions',
                as: 'reaction',
                cond: {
                  $eq: ['$$reaction.type', ReactionType.Like]
                }
              }
            },
            dislikes: {
              $filter: {
                input: '$reactions',
                as: 'reaction',
                cond: {
                  $eq: ['$$reaction.type', ReactionType.Dislike]
                }
              }
            },
            reactionOfUser: {
              $filter: {
                input: '$reactions',
                as: 'reaction',
                cond: {
                  $eq: ['$$reaction.accountId', new ObjectId(accountId)]
                }
              }
            },
            'author.avatar': {
              $cond: {
                if: '$authorAvatar',
                then: {
                  $concat: [ENV_CONFIG.HOST, ENV_CONFIG.PUBLIC_IMAGES_PATH, '/', '$authorAvatar.name']
                },
                else: ''
              }
            }
          }
        },
        {
          $unwind: {
            path: '$reactionOfUser',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            likeCount: {
              $size: '$likes'
            },
            dislikeCount: {
              $size: '$dislikes'
            },
            isLiked: {
              $cond: {
                if: {
                  $and: [
                    '$reactionOfUser',
                    {
                      $eq: ['$reactionOfUser.type', ReactionType.Like]
                    }
                  ]
                },
                then: true,
                else: false
              }
            },
            isDisliked: {
              $cond: {
                if: {
                  $and: [
                    '$reactionOfUser',
                    {
                      $eq: ['$reactionOfUser.type', ReactionType.Dislike]
                    }
                  ]
                },
                then: true,
                else: false
              }
            }
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
            replyCount: {
              $first: '$replyCount'
            },
            likeCount: {
              $first: '$likeCount'
            },
            dislikeCount: {
              $first: '$dislikeCount'
            },
            isLiked: {
              $first: '$isLiked'
            },
            isDisliked: {
              $first: '$isDisliked'
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
            'author.cover': 0,
            'author.role': 0,
            'author.status': 0,
            'author.verify': 0,
            'author.forgotPasswordToken': 0,
            'author.resetPasswordToken': 0,
            'author.verifyEmailToken': 0
          }
        }
      ])
      .toArray()
    return {
      comment: newComment[0]
    }
  }

  // Cập nhật bình luận
  async updateComment({ commentId, content }: { commentId: string; content: string }) {
    const updatedComment = await databaseService.comments.findOneAndUpdate(
      { _id: new ObjectId(commentId) },
      {
        $set: { content },
        $currentDate: { updatedAt: true }
      },
      {
        returnDocument: 'after'
      }
    )
    return {
      comment: updatedComment
    }
  }

  // Xóa bình luận
  async deleteComment(commentId: string) {
    const comment = (await databaseService.comments.findOne({ _id: new ObjectId(commentId) })) as WithId<Comment>
    // Khi xóa bình luận gốc thì xóa luôn các trả lời bình luận
    if (!comment.parentId) {
      await Promise.all([
        databaseService.comments.deleteOne({ _id: new ObjectId(commentId) }),
        databaseService.comments.deleteMany({ parentId: new ObjectId(commentId) })
      ])
    } else {
      await databaseService.comments.deleteOne({ _id: new ObjectId(commentId) })
    }
    return true
  }

  // Trả lời bình luận
  async replyComment({
    commentId,
    body,
    accountId
  }: {
    commentId: string
    body: ReplyCommentReqBody
    accountId: string
  }) {
    const parentComment = (await databaseService.comments.findOne({ _id: new ObjectId(commentId) })) as WithId<Comment>
    const { _id, contentId, type } = parentComment
    const { insertedId } = await databaseService.comments.insertOne(
      new Comment({
        accountId: new ObjectId(accountId),
        contentId,
        parentId: _id,
        content: body.content,
        type,
        replyAccountId: body.replyAccountId ? new ObjectId(body.replyAccountId) : null
      })
    )
    const newReplyComment = await databaseService.comments
      .aggregate([
        {
          $match: {
            _id: insertedId
          }
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
          $lookup: {
            from: 'images',
            localField: 'author.avatar',
            foreignField: '_id',
            as: 'authorAvatar'
          }
        },
        {
          $unwind: {
            path: '$authorAvatar',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'comments',
            localField: '_id',
            foreignField: 'parentId',
            as: 'replies'
          }
        },
        {
          $lookup: {
            from: 'reactions',
            localField: '_id',
            foreignField: 'contentId',
            as: 'reactions'
          }
        },
        {
          $addFields: {
            replyCount: {
              $size: '$replies'
            },
            likes: {
              $filter: {
                input: '$reactions',
                as: 'reaction',
                cond: {
                  $eq: ['$$reaction.type', ReactionType.Like]
                }
              }
            },
            dislikes: {
              $filter: {
                input: '$reactions',
                as: 'reaction',
                cond: {
                  $eq: ['$$reaction.type', ReactionType.Dislike]
                }
              }
            },
            reactionOfUser: {
              $filter: {
                input: '$reactions',
                as: 'reaction',
                cond: {
                  $eq: ['$$reaction.accountId', new ObjectId(accountId)]
                }
              }
            },
            'author.avatar': {
              $cond: {
                if: '$authorAvatar',
                then: {
                  $concat: [ENV_CONFIG.HOST, ENV_CONFIG.PUBLIC_IMAGES_PATH, '/', '$authorAvatar.name']
                },
                else: ''
              }
            }
          }
        },
        {
          $unwind: {
            path: '$reactionOfUser',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            likeCount: {
              $size: '$likes'
            },
            dislikeCount: {
              $size: '$dislikes'
            },
            isLiked: {
              $cond: {
                if: {
                  $and: [
                    '$reactionOfUser',
                    {
                      $eq: ['$reactionOfUser.type', ReactionType.Like]
                    }
                  ]
                },
                then: true,
                else: false
              }
            },
            isDisliked: {
              $cond: {
                if: {
                  $and: [
                    '$reactionOfUser',
                    {
                      $eq: ['$reactionOfUser.type', ReactionType.Dislike]
                    }
                  ]
                },
                then: true,
                else: false
              }
            }
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
            replyCount: {
              $first: '$replyCount'
            },
            likeCount: {
              $first: '$likeCount'
            },
            dislikeCount: {
              $first: '$dislikeCount'
            },
            isLiked: {
              $first: '$isLiked'
            },
            isDisliked: {
              $first: '$isDisliked'
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
            'author.cover': 0,
            'author.role': 0,
            'author.status': 0,
            'author.verify': 0,
            'author.forgotPasswordToken': 0,
            'author.resetPasswordToken': 0,
            'author.verifyEmailToken': 0
          }
        }
      ])
      .toArray()
    return {
      comment: newReplyComment[0]
    }
  }

  // Lấy danh sách bình luận
  async getComments({
    contentId,
    query,
    accountId
  }: {
    contentId: string
    query: GetCommentsReqQuery
    accountId?: string
  }) {
    const { page, limit, orderBy, sortBy = 'createdAt' } = query
    const _page = Number(page) || 1
    const _limit = Number(limit) || 20
    const skip = (_page - 1) * _limit
    const sort = { [sortBy]: orderBy === 'asc' ? 1 : -1 }
    const [comments, totalRows, totalRowsWithReplies] = await Promise.all([
      databaseService.comments
        .aggregate([
          {
            $match: {
              contentId: new ObjectId(contentId),
              parentId: null
            }
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
            $lookup: {
              from: 'images',
              localField: 'author.avatar',
              foreignField: '_id',
              as: 'authorAvatar'
            }
          },
          {
            $unwind: {
              path: '$authorAvatar',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: 'comments',
              localField: '_id',
              foreignField: 'parentId',
              as: 'replies'
            }
          },
          {
            $lookup: {
              from: 'reactions',
              localField: '_id',
              foreignField: 'contentId',
              as: 'reactions'
            }
          },
          {
            $addFields: {
              replyCount: {
                $size: '$replies'
              },
              likes: {
                $filter: {
                  input: '$reactions',
                  as: 'reaction',
                  cond: {
                    $eq: ['$$reaction.type', ReactionType.Like]
                  }
                }
              },
              dislikes: {
                $filter: {
                  input: '$reactions',
                  as: 'reaction',
                  cond: {
                    $eq: ['$$reaction.type', ReactionType.Dislike]
                  }
                }
              },
              reactionOfUser: {
                $filter: {
                  input: '$reactions',
                  as: 'reaction',
                  cond: {
                    $eq: ['$$reaction.accountId', new ObjectId(accountId)]
                  }
                }
              },
              'author.avatar': {
                $cond: {
                  if: '$authorAvatar',
                  then: {
                    $concat: [ENV_CONFIG.HOST, ENV_CONFIG.PUBLIC_IMAGES_PATH, '/', '$authorAvatar.name']
                  },
                  else: ''
                }
              }
            }
          },
          {
            $unwind: {
              path: '$reactionOfUser',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $addFields: {
              likeCount: {
                $size: '$likes'
              },
              dislikeCount: {
                $size: '$dislikes'
              },
              isLiked: {
                $cond: {
                  if: {
                    $and: [
                      '$reactionOfUser',
                      {
                        $eq: ['$reactionOfUser.type', ReactionType.Like]
                      }
                    ]
                  },
                  then: true,
                  else: false
                }
              },
              isDisliked: {
                $cond: {
                  if: {
                    $and: [
                      '$reactionOfUser',
                      {
                        $eq: ['$reactionOfUser.type', ReactionType.Dislike]
                      }
                    ]
                  },
                  then: true,
                  else: false
                }
              }
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
              replyCount: {
                $first: '$replyCount'
              },
              likeCount: {
                $first: '$likeCount'
              },
              dislikeCount: {
                $first: '$dislikeCount'
              },
              isLiked: {
                $first: '$isLiked'
              },
              isDisliked: {
                $first: '$isDisliked'
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
              'author.cover': 0,
              'author.role': 0,
              'author.status': 0,
              'author.verify': 0,
              'author.forgotPasswordToken': 0,
              'author.resetPasswordToken': 0,
              'author.verifyEmailToken': 0
            }
          },
          {
            $sort: sort
          },
          {
            $skip: skip
          },
          {
            $limit: _limit
          }
        ])
        .toArray(),
      databaseService.comments.countDocuments({
        contentId: new ObjectId(contentId),
        parentId: null
      }),
      databaseService.comments.countDocuments({
        contentId: new ObjectId(contentId)
      })
    ])
    return {
      comments,
      page: _page,
      limit: _limit,
      totalRows,
      totalPages: Math.ceil(totalRows / _limit),
      totalRowsWithReplies
    }
  }

  // Lấy danh sách trả lời của bình luận
  async getRepliesOfComments({
    commentId,
    query,
    accountId
  }: {
    commentId: string
    query: PaginationReqQuery
    accountId?: string
  }) {
    const { page, limit } = query
    const _page = Number(page) || 1
    const _limit = Number(limit) || 20
    const skip = (_page - 1) * _limit
    const [comments, totalRows] = await Promise.all([
      databaseService.comments
        .aggregate([
          {
            $match: {
              parentId: new ObjectId(commentId)
            }
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
            $lookup: {
              from: 'images',
              localField: 'author.avatar',
              foreignField: '_id',
              as: 'authorAvatar'
            }
          },
          {
            $unwind: {
              path: '$authorAvatar',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: 'comments',
              localField: '_id',
              foreignField: 'parentId',
              as: 'replies'
            }
          },
          {
            $lookup: {
              from: 'reactions',
              localField: '_id',
              foreignField: 'contentId',
              as: 'reactions'
            }
          },
          {
            $lookup: {
              from: 'accounts',
              localField: 'replyAccountId',
              foreignField: '_id',
              as: 'replyAccount'
            }
          },
          {
            $unwind: {
              path: '$replyAccount',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $addFields: {
              replyCount: {
                $size: '$replies'
              },
              likes: {
                $filter: {
                  input: '$reactions',
                  as: 'reaction',
                  cond: {
                    $eq: ['$$reaction.type', ReactionType.Like]
                  }
                }
              },
              dislikes: {
                $filter: {
                  input: '$reactions',
                  as: 'reaction',
                  cond: {
                    $eq: ['$$reaction.type', ReactionType.Dislike]
                  }
                }
              },
              reactionOfUser: {
                $filter: {
                  input: '$reactions',
                  as: 'reaction',
                  cond: {
                    $eq: ['$$reaction.accountId', new ObjectId(accountId)]
                  }
                }
              },
              'author.avatar': {
                $cond: {
                  if: '$authorAvatar',
                  then: {
                    $concat: [ENV_CONFIG.HOST, ENV_CONFIG.PUBLIC_IMAGES_PATH, '/', '$authorAvatar.name']
                  },
                  else: ''
                }
              }
            }
          },
          {
            $unwind: {
              path: '$reactionOfUser',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $addFields: {
              likeCount: {
                $size: '$likes'
              },
              dislikeCount: {
                $size: '$dislikes'
              },
              isLiked: {
                $cond: {
                  if: {
                    $and: [
                      '$reactionOfUser',
                      {
                        $eq: ['$reactionOfUser.type', ReactionType.Like]
                      }
                    ]
                  },
                  then: true,
                  else: false
                }
              },
              isDisliked: {
                $cond: {
                  if: {
                    $and: [
                      '$reactionOfUser',
                      {
                        $eq: ['$reactionOfUser.type', ReactionType.Dislike]
                      }
                    ]
                  },
                  then: true,
                  else: false
                }
              }
            }
          },
          {
            $group: {
              _id: '$_id',
              author: {
                $first: '$author'
              },
              replyAccount: {
                $first: '$replyAccount'
              },
              content: {
                $first: '$content'
              },
              replyCount: {
                $first: '$replyCount'
              },
              likeCount: {
                $first: '$likeCount'
              },
              dislikeCount: {
                $first: '$dislikeCount'
              },
              isLiked: {
                $first: '$isLiked'
              },
              isDisliked: {
                $first: '$isDisliked'
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
              'author.cover': 0,
              'author.role': 0,
              'author.status': 0,
              'author.verify': 0,
              'author.forgotPasswordToken': 0,
              'author.resetPasswordToken': 0,
              'author.verifyEmailToken': 0,
              'replyAccount.avatar': 0,
              'replyAccount.channelName': 0,
              'replyAccount.tick': 0,
              'replyAccount.email': 0,
              'replyAccount.password': 0,
              'replyAccount.bio': 0,
              'replyAccount.cover': 0,
              'replyAccount.role': 0,
              'replyAccount.status': 0,
              'replyAccount.verify': 0,
              'replyAccount.forgotPasswordToken': 0,
              'replyAccount.resetPasswordToken': 0,
              'replyAccount.verifyEmailToken': 0
            }
          },
          {
            $sort: {
              createdAt: 1
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
      databaseService.comments.countDocuments({
        parentId: new ObjectId(commentId)
      })
    ])
    return {
      comments,
      page: _page,
      limit: _limit,
      totalRows,
      totalPages: Math.ceil(totalRows / _limit)
    }
  }

  // Lấy thông tin một bình luận
  async getCommentDetail(commentId: string) {
    const comment = await databaseService.comments.findOne({ _id: new ObjectId(commentId) })
    return {
      comment
    }
  }
}

const commentService = new CommentService()
export default commentService
