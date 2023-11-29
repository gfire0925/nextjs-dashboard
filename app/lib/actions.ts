'use server';

import { sql } from "@vercel/postgres";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({invalid_type_error:'Please select a customer'}),
    amount: z.coerce.number().gt(0, {message: 'Please enter an amount greater then $0'}),
    status: z.enum(['pending','paid'],{invalid_type_error:'please select an invoice status'}),
    date: z.string()
});

const CreateInvoice = FormSchema.omit({id:true, date:true});
const UpdateInvoice = FormSchema.omit({id:true, date:true});

export type State = {
    errors?:{
        customerId?: string[];
        amount?: string[],
        status?: string[];
    };
    message?: string | null;
}

export async function createInvoice(prevState: State, formData: FormData){

    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    });

    if(!validatedFields.success){
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice'
        };
    }

    const {customerId, amount, status} = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    console.log("### CreateInvoice : " + customerId);
    console.log("### CreateInvoice : " + amount+' type is '+ typeof amount);
    console.log("### CreateInvoice : " + status);
    try{
        await sql `
            INSERT INTO invoices (customer_id, amount, status, date) 
            VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;
    }catch(error){
        return {message: 'create database error'};
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function updateInvoice(id:string, prevState: State, formData: FormData){

    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    });

    if(!validatedFields.success){
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to edit Invoice'
        };
    }

    const {customerId, amount, status} = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    console.log("### updateInvoice : " + id);
    console.log("### updateInvoice : " + customerId);
    console.log("### updateInvoice : " + amountInCents+' type is '+ typeof amountInCents);
    console.log("### updateInvoice : " + status);

    try{
        await sql `
            UPDATE invoices SET
            customer_id = ${customerId},
            amount = ${amountInCents},
            status = ${status},
            date = ${date}
            WHERE id = ${id}
        `;
    }catch(error){
        return {message: 'update database error'};
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id:string){
//    throw new Error('error delete');

    console.log("### deleteInvoice : " + id);
    try{
        await sql `
            DELETE FROM invoices
            WHERE id = ${id}
        `;
    }catch(error){
        return {message: 'delete database error'};
    }

    revalidatePath('/dashboard/invoices');
}