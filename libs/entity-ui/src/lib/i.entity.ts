import { Id } from '@find-a-buddy/data'

/**
 * Base class for all entities that are part of communication to/from services.
 */
export interface IEntity {
    id?: Id
    userid?: Id

    // constructor(values: any) {
    //   this.id = values ? values.id : undefined
    //   this.userid = values ? values.userid : undefined
    // }
}
