import { ENV_CONFIG } from '~/constants/config'

export const generateVideosListAggregate = ({ match, skip, limit }: { match: any; skip: number; limit: number }) => {
  return [
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
        localField: 'thumbnail',
        foreignField: '_id',
        as: 'thumbnail'
      }
    },
    {
      $unwind: {
        path: '$thumbnail'
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
        thumbnailUrl: {
          $concat: [ENV_CONFIG.HOST, ENV_CONFIG.PUBLIC_IMAGES_PATH, '/', '$thumbnail.name']
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
      $group: {
        _id: '$_id',
        idName: {
          $first: '$idName'
        },
        thumbnail: {
          $first: '$thumbnailUrl'
        },
        title: {
          $first: '$title'
        },
        author: {
          $first: '$author'
        },
        viewCount: {
          $first: '$views'
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
        'author.password': 0,
        'author.role': 0,
        'author.status': 0,
        'author.verify': 0,
        'author.forgotPasswordToken': 0,
        'author.verifyEmailToken': 0,
        'author.cover': 0,
        'author.bio': 0
      }
    },
    {
      $skip: skip
    },
    {
      $limit: limit
    }
  ]
}
