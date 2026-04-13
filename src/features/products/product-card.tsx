import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { star } from '@/assets/icons';
import type { Product } from '@/assets/images/index'

import { cn } from '@/utils/theme';

interface ProductCardProps {
    product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
    return (
        <Card
        // className={cn(
        //     'mt-4 shadow-none border-border rounded-sm max-w-xl',
        //     className,
        //     {
        //         'max-w-2xl': chartData.length > 5,
        //         'max-w-3xl': chartData.length >= 9,
        //     },
        // )}
        >
            <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription className="text-[1rem] text-foreground mt-1">
                    Ukupno komada:{' '}
                    <span className="font-semibold">{222}</span>
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Image
                    // className="dark:invert"
                    src={product.imgURL}
                    alt="Vercel logomark"
                    width={150}
                    height={150}
                />
            </CardContent>

            <CardFooter className="flex-col items-start gap-2 text-sm">
                <p className="text-xl leading-none font-lexend">
                    Cena: {product.price}
                </p>
                <div className='mt-8 flex justify-start gap-2.5 border-2 border-blue-500'>
                    <Image src={star} alt='rating icon' width={24} height={24} />
                    <p className='font-montserrat text-xl leading-normal text-slate-gray'>
                        Rejting (4.5)
                    </p>
                </div>

            </CardFooter>
        </Card>
    );
};