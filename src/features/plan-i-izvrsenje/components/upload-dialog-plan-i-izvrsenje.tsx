"use client";

import { CommonDialog } from '@/components/ui/dialog/common-dialog';
import { useDisclosure } from '@/hooks';
import { UploadPlanIIzvrsenjeDataForm } from '@/features/plan-i-izvrsenje/components/upload-plan-i-izvrsenje-form';

type UploadDialogForPlanIIzvrsenjeProps = {
    triggerButton: React.ReactElement;
};
export function UploadDialogForPlanIIzvrsenje({
    triggerButton,
}: UploadDialogForPlanIIzvrsenjeProps) {

    const createPlanActions = useDisclosure();

    return (
        <>
            <CommonDialog
                title={`Plan i izvrsenje`}
                triggerButton={triggerButton}
                isOpen={createPlanActions.isOpen}
                onOpenChange={createPlanActions.toggle}
                className="max-w-xl"
                content={
                    <div className="mb-8">
                        <UploadPlanIIzvrsenjeDataForm closeCreteTable={createPlanActions.toggle} />
                    </div>
                }
            />
        </>
    );
}
