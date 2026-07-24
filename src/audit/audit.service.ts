import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {

constructor(

@InjectRepository(AuditLog)

private repo:Repository<AuditLog>,

){}

async log(data:Partial<AuditLog>){

return this.repo.save(data);

}

}