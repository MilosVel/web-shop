"use client";

import { CommonDialog } from '@/components/ui/dialog/common-dialog';

import { useDisclosure } from '@/hooks';

import { PaymentFileForm } from "@/features/spiri/payment/components/payment-file-form"

type ManageAgentAccountFormProps = {
    triggerButton: React.ReactElement;
};
export function ManagePayment({
    triggerButton,
}: ManageAgentAccountFormProps) {

    const managePaymentActions = useDisclosure();



    return (
        <>
            <CommonDialog
                title={`Generate Payment file`}
                triggerButton={triggerButton}
                isOpen={managePaymentActions.isOpen}
                onOpenChange={managePaymentActions.toggle}
                className="max-w-xl"
                content={
                    <div className="mb-8">
                        <PaymentFileForm onClose={managePaymentActions.toggle} />
                    </div>
                }
            />
        </>
    );
}
