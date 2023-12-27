import isUndefined from 'lodash/isUndefined'
import omit from 'lodash/omit'
import omitBy from 'lodash/omitBy'
import { ObjectId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import { ReactionType } from '~/constants/enum'
import { PaginationReqQuery } from '~/models/requests/Common.requests'
import { CreatePostReqBody, UpdatePostReqBody } from '~/models/requests/Post.requests'
import Post from '~/models/schemas/Post.schema'
import databaseService from './database.services'

class PostService {
  // Thêm bài viết
  async createPost({ body, accountId }: { body: CreatePostReqBody; accountId: string }) {
    const { images, content } = body
    const { insertedId } = await databaseService.posts.insertOne(
      new Post({
        accountId: new ObjectId(accountId),
        content,
        images: images ? images.map((item) => new ObjectId(item)) : undefined
      })
    )
    const newPost = await databaseService.posts.findOne({ _id: insertedId })
    return {
      post: newPost
    }
  }

  // Cập nhật bài viết
  async updatePost({ body, postId }: { body: UpdatePostReqBody; postId: string }) {
    let bodyConfig = omitBy(body, isUndefined)
    bodyConfig = omit(bodyConfig, ['images'])
    const imagesConfig = body.images ? body.images.map((image) => new ObjectId(image)) : []
    const updatedPost = await databaseService.posts.findOneAndUpdate(
      {
        _id: new ObjectId(postId)
      },
      {
        $set: bodyConfig,
        $push: {
          images: {
            $each: imagesConfig
          }
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
      post: updatedPost
    }
  }

  // Xóa bài viết
  async deletePosts(postIds: string[]) {
    const _postIds = postIds.map((id) => new ObjectId(id))
    const { deletedCount } = await databaseService.posts.deleteMany({
      _id: {
        $in: _postIds
      }
    })
    return {
      deletedCount
    }
  }

  // Lấy danh sách post ở trang cá nhân
  async getPostsInProfilePage({
    query,
    profileId,
    accountId
  }: {
    query: PaginationReqQuery
    profileId: string
    accountId?: string
  }) {
    const { page, limit } = query
    const _page = Number(page) || 1
    const _limit = Number(limit) || 20
    const skip = (_page - 1) * _limit
    const [posts, totalRows] = await Promise.all([
      databaseService.posts
        .aggregate([
          {
            $match: {
              accountId: new ObjectId(profileId)
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
              localField: 'images',
              foreignField: '_id',
              as: 'images'
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
            $addFields: {
              images: {
                $map: {
                  input: '$images',
                  as: 'image',
                  in: {
                    $concat: [ENV_CONFIG.HOST, ENV_CONFIG.PUBLIC_IMAGES_PATH, '/', '$$image.name']
                  }
                }
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
              images: {
                $first: '$images'
              },
              content: {
                $first: '$content'
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
              'author.verifyEmailToken': 0
            }
          },
          {
            $sort: {
              createdAt: -1
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
      databaseService.posts.countDocuments({ accountId: new ObjectId(profileId) })
    ])
    return {
      posts,
      page: _page,
      limit: _limit,
      totalRows,
      totalPages: Math.ceil(totalRows / _limit)
    }
  }
}

const postService = new PostService()
export default postService
