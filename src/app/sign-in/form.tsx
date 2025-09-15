import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email').min(1, 'Email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters').min(1, 'Password is required'),
    confirmPassword: z.string().min(1, 'Confirm Password is required'),
    image: z.string().url('Invalid URL'),
    callbackURL: z.string().url('Invalid URL'),
}).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({
            code: "custom",
            message: "Passwords don't match",
            path: ['confirmPassword'],
        });
    }
});

const SignInForm: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = (data: any) => {
        console.log(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label>Name</label>
                <input {...register('name')} />
                {errors.name && <p>{errors.name.message}</p>}
            </div>
            <div>
                <label>Email</label>
                <input {...register('email')} />
                {errors.email && <p>{errors.email.message}</p>}
            </div>
            <div>
                <label>Password</label>
                <input type="password" {...register('password')} />
                {errors.password && <p>{errors.password.message}</p>}
            </div>
            <div>
                <label>Confirm Password</label>
                <input type="password" {...register('confirmPassword')} />
                {errors.confirmPassword && <p>{errors.confirmPassword.message}</p>}
            </div>
            <div>
                <label>Image URL</label>
                <input {...register('image')} />
                {errors.image && <p>{errors.image.message}</p>}
            </div>
            <div>
                <label>Callback URL</label>
                <input {...register('callbackURL')} />
                {errors.callbackURL && <p>{errors.callbackURL.message}</p>}
            </div>
            <button type="submit">Sign In</button>
        </form>
    );
};

export default SignInForm;