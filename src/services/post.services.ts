import isUndefined from 'lodash/isUndefined'
import omit from 'lodash/omit'
import omitBy from 'lodash/omitBy'
import { ObjectId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import { PostAudience, ReactionType } from '~/constants/enum'
import { PaginationReqQuery } from '~/models/requests/Common.requests'
import { CreatePostReqBody, UpdatePostReqBody } from '~/models/requests/Post.requests'
import Post from '~/models/schemas/Post.schema'
import databaseService from './database.services'

class PostService {
  // Create a new post
  async createPost({ body, accountId }: { body: CreatePostReqBody; accountId: string }) {
    const { images, content, audience } = body
    const { insertedId } = await databaseService.posts.insertOne(
      new Post({
        accountId: new ObjectId(accountId),
        content,
        images: images ? images.map((item) => new ObjectId(item)) : undefined,
        audience
      })
    )
    const newPost = await databaseService.posts.findOne({ _id: insertedId })
    return {
      post: newPost
    }
  }

  // Update a post
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

  // Delete posts
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

  // Get posts
  private async getPosts({
    match,
    skip = 0,
    limit = 20,
    loggedAccountId
  }: {
    match: any
    skip?: number
    limit?: number
    loggedAccountId?: string
  }) {
    const posts = await databaseService.posts
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
                  $eq: ['$$reaction.accountId', new ObjectId(loggedAccountId)]
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
          $lookup: {
            from: 'comments',
            localField: '_id',
            foreignField: 'contentId',
            as: 'comments'
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
            },
            commentCount: {
              $size: '$comments'
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
            commentCount: {
              $first: '$commentCount'
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
          $limit: limit
        }
      ])
      .toArray()
    return posts
  }

  // Get posts by username
  async getPostsByUsername({
    query,
    username,
    loggedAccountId
  }: {
    query: PaginationReqQuery
    username: string
    loggedAccountId?: string
  }) {
    const { page, limit } = query
    const _page = Number(page) || 1
    const _limit = Number(limit) || 20
    const skip = (_page - 1) * _limit
    const accountByUsername = await databaseService.accounts.findOne({ username })
    const match = {
      accountId: new ObjectId(accountByUsername?._id),
      audience: PostAudience.Everyone
    }
    const [posts, totalRows] = await Promise.all([
      this.getPosts({
        match,
        skip,
        limit: _limit,
        loggedAccountId
      }),
      databaseService.posts.countDocuments(match)
    ])
    return {
      posts,
      page: _page,
      limit: _limit,
      totalRows,
      totalPages: Math.ceil(totalRows / _limit)
    }
  }

  // Get my posts
  async getMyPosts({ query, accountId }: { query: PaginationReqQuery; accountId: string }) {
    const { page, limit } = query
    const _page = Number(page) || 1
    const _limit = Number(limit) || 20
    const skip = (_page - 1) * _limit
    const [posts, totalRows] = await Promise.all([
      this.getPosts({
        match: { accountId: new ObjectId(accountId) },
        skip,
        limit: _limit,
        loggedAccountId: accountId
      }),
      databaseService.posts.countDocuments({ accountId: new ObjectId(accountId) })
    ])
    return {
      posts,
      page: _page,
      limit: _limit,
      totalRows,
      totalPages: Math.ceil(totalRows / _limit)
    }
  }

  // Get post detail
  async getPostDetail({ postId, loggedAccountId }: { postId: string; loggedAccountId?: string }) {
    const post = await databaseService.posts
      .aggregate([
        {
          $match: {
            _id: new ObjectId(postId)
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
          $lookup: {
            from: 'comments',
            localField: '_id',
            foreignField: 'contentId',
            as: 'comments'
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
                  $eq: ['$$reaction.accountId', new ObjectId(loggedAccountId)]
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
            },
            commentCount: {
              $size: '$comments'
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
            commentCount: {
              $first: '$commentCount'
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
        }
      ])
      .toArray()
    return {
      post: post[0]
    }
  }
}

const postService = new PostService()
export default postService
