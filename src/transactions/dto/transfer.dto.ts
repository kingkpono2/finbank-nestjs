import { IsNumber, IsString, Min } from 'class-validator';

export class TransferDto {

    @IsString()
    fromAccount:string;

    @IsString()
    toAccount:string;

    @IsNumber()
    @Min(1)
    amount:number;

    @IsString()
    narration:string;
}