import { NextResponse } from 'next/server';

export const successHandler = (data:any = undefined) => {
    const resposeConfig = data ? { message: `OK`, data } : { message: `OK` };
    return NextResponse.json(resposeConfig, {
        status: 200
    });
};

export const createHandler = (data:any = undefined) => {
    const resposeConfig = data ? { message: `OK`, data } : { message: `OK` };
    return NextResponse.json(resposeConfig, {
        status: 201
    });
};

export const notFoundHandler = (message: string) => {
    return NextResponse.json({ message }, {
        status: 404
    });
};

export const errorHandler = (error: Error) => {
    console.error('Internal server error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: `Internal server error`,  error: errorMessage }, {
        status: 500
    });
};

