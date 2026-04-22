"use client";

import { CommonDialog } from '@/components/ui/dialog/common-dialog';
import { useDisclosure } from '@/hooks';
import { IzvrsenjeBudzetaForm } from '@/features/izvrsenje-budzeta/components/izvrsenje-budzeta-form';

import type { IzvrsenjeBudzetaResult } from "@/features/izvrsenje-budzeta/dto";

type DialogUploadIzvrsenjeBuzetaProps = {
    triggerButton: React.ReactElement;
    onDataProcessed?: (data:IzvrsenjeBudzetaResult) => void;
};
export function DialogUploadIzvrsenjeBuzeta({
    triggerButton,
    onDataProcessed,
}: DialogUploadIzvrsenjeBuzetaProps) {

    const createIzvrsenjeBudzetaActions = useDisclosure();

    return (
        <>
            <CommonDialog
                title={`Izvrsenje budzeta`}
                triggerButton={triggerButton}
                isOpen={createIzvrsenjeBudzetaActions.isOpen}
                onOpenChange={createIzvrsenjeBudzetaActions.toggle}
                className="max-w-xl"
                content={
                    <div className="mb-8">
                        <IzvrsenjeBudzetaForm 
                            closeCreteTable={createIzvrsenjeBudzetaActions.toggle} 
                            onDataProcessed={onDataProcessed}
                        />
                    </div>
                }
            />
        </>
    );
}
