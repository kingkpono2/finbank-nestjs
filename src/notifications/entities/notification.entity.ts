import {
Entity,
PrimaryGeneratedColumn,
Column,
CreateDateColumn,
} from "typeorm";

@Entity()
export class NotificationLog{

@PrimaryGeneratedColumn("uuid")
id:string;

@Column()
channel:string;

@Column()
recipient:string;

@Column()
subject:string;

@Column({
type:"text",
})
body:string;

@Column()
status:string;

@Column()
provider:string;

@CreateDateColumn()
createdAt:Date;

}