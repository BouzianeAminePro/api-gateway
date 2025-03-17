import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
// import { MerchantGuard } from '../merchants/merchant.guard';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post(':merchantId')
    //   @UseGuards(MerchantGuard)
    @Roles('ADMIN')
    createPayment(
        @Param('merchantId') merchantId: string,
        @Body() paymentData: any,
    ) {
        return this.paymentsService.createPayment(merchantId, paymentData);
    }

    //   @Get(':merchantId/:transactionId')
    // //   @UseGuards(MerchantGuard)
    //   getPaymentStatus(
    //     @Param('merchantId') merchantId: string,
    //     @Param('transactionId') transactionId: string,
    //   ) {
    //     return this.paymentsService.getPaymentStatus(merchantId, transactionId);
    //   }
}
