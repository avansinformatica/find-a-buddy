import { Id } from './id.type'
import { Review } from './review.interface'

export interface UserIdentity {
    id: Id
    name: string
}

export interface UserInfo extends UserIdentity {
    rating: number
    isActive: boolean
    emailAddress: string
    roles: string[]

    pupilTopics: string[]
    tutorTopics: string[]
}

export interface User extends UserInfo {
    reviews: Review[]
}
