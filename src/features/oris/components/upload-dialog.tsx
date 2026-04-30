"use client";

import { CommonDialog } from '@/components/ui/dialog/common-dialog';

import { useDisclosure } from '@/hooks';

import { PaymentFileForm } from "@/features/spiri/payment/components/payment-file-form"
import { OrisForm } from "@/features/oris/components/oris-form"

type UploadDialogProps = {
    triggerButton: React.ReactElement;
};
export function UploadDialog({
    triggerButton,
}: UploadDialogProps) {

    const uploadDialogActions = useDisclosure();



    return (
        <>
            <CommonDialog
                title={`Upload SPIRI izvrsenje`}
                triggerButton={triggerButton}
                isOpen={uploadDialogActions.isOpen}
                onOpenChange={uploadDialogActions.toggle}
                className="max-w-xl"
                content={
                    <div className="mb-8">
                        <OrisForm onClose={uploadDialogActions.toggle} />
                    </div>
                }
            />
        </>
    );
}
