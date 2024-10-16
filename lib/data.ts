let id: number = 0;
export interface IPost {
    id: string;
    title: string;
    description: string;
    createdAt: Date;
    updatedAt?: Date;
};

let posts: IPost[] = [];

export const getPosts = () => { 
    return posts;   
};

export const addPost = (post: IPost) => {
    const postData = { ...post, id: (++id).toString(), createdAt: new Date() };
    posts.push(postData);
    return postData;
};

export const getPostById = (id: string) => {
    const post = posts.find((post) => post.id === id);
    return post ? post : null;
};

export const updatePostById = (id: string, updatedPostData: Partial<IPost>) => {
  const index = posts.findIndex((post) => post.id === id);
     if (index !== -1) {
        const keysToInclude: Array<keyof IPost> = ['title', 'description'];
        const isDataChanged = Object.keys(updatedPostData).some((key) => {
            const propertyKey = key as keyof IPost;
            return keysToInclude.includes(propertyKey) && updatedPostData[propertyKey] !== posts[index][propertyKey];
        });
        if (isDataChanged) {
            posts[index] = { ...posts[index], ...updatedPostData, id, createdAt: posts[index].createdAt, updatedAt: new Date() };
            return posts[index];
        } else {
            return posts[index];
        }
    } else {
        return null;
    }
};

export const deletePostById = (id: string) => {
    const initialLength = posts.length;
    posts = posts.filter((post) => post.id !== id);
    if (posts.length === initialLength) {
        return false;
    }
    return true;
};