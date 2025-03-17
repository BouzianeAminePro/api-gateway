import { Injectable } from '@nestjs/common';
import CmiClient from 'cmi-payment-nodejs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentsService {
    constructor(private prisma: PrismaService) { }

    async createPayment(merchantId: string, paymentData: {
        amount: number;
        currency: string;
        source: any;
        customer?: any;
        metadata?: any;
    }) {
        // Get merchant data
        const merchant = await this.prisma.merchant.findUnique({
            where: { id: merchantId },
        });

        if (!merchant || !merchant.checkoutSecretKey) {
            throw new Error('Merchant not found or missing CMI credentials');
        }

        // Initialize CMI SDK with merchant credentials
        const cmi = new CmiClient({
            storekey: merchant.checkoutSecretKey,
            clientid: String(merchant.checkoutApiKey),
            oid: paymentData.metadata?.orderId || `order-${Date.now()}`, // A unique command ID
            // okUrl: merchant.successUrl || 'https://your-success-redirect-url.com',
            // failUrl: merchant.failureUrl || 'https://your-failure-redirect-url.com',
            email: paymentData.customer?.email,
            BillToName: paymentData.customer?.name,
            amount: paymentData.amount.toString(),
            // callbackURL: merchant.callbackUrl || 'https://your-callback-url.com',
        });

        // Generate HTML form for the CMI payment
        const htmlForm = cmi.redirect_post();

        // Record transaction in database
        const transaction = await this.prisma.transaction.create({
            data: {
                amount: paymentData.amount,
                currency: paymentData.currency,
                status: 'pending',
                checkoutPaymentId: paymentData.metadata?.orderId || `order-${Date.now()}`,
                metadata: paymentData.metadata || {},
                merchantId: merchantId,
                customerId: paymentData.customer?.id,
            },
        });

        return {
            transaction,
            htmlForm
        };
    }

    // async getPaymentStatus(merchantId: string, transactionId: string) {
    //     const transaction = await this.prisma.transaction.findFirst({
    //         where: {
    //             id: transactionId,
    //             merchantId,
    //         },
    //     });

    //     if (!transaction) {
    //         throw new Error('Transaction not found');
    //     }

    //     const merchant = await this.prisma.merchant.findUnique({
    //         where: { id: merchantId },
    //     });

    //     if (!merchant || !merchant.checkoutSecretKey) {
    //         throw new Error('Merchant not found or missing CMI credentials');
    //     }

    //     // Initialize CMI SDK with merchant credentials
    //     const cmi = new CmiClient({
    //         storekey: merchant.checkoutSecretKey,
    //         clientid: String(merchant.checkoutApiKey),
    //     });

    //     // Get payment details from CMI
    //     const response = await cmi.get(String(transaction.checkoutPaymentId));

    //     // Update transaction status in database
    //     await this.prisma.transaction.update({
    //         where: { id: transactionId },
    //         data: {
    //             status: response.status,
    //         },
    //     });

    //     return {
    //         transaction: {
    //             ...transaction,
    //             status: response.status,
    //         },
    //         checkoutResponse: response,
    //     };
    // }
}
