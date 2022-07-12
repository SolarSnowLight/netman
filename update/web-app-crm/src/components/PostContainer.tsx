import React from 'react';
import { postAPI } from '../services/PostService';

const PostContainer = () => {
    const {data: posts} = postAPI.useFetchAllPostsQuery(10);
    return (
        <div>
            {posts?.map(item => item.id)}
        </div>
    );
};

export default PostContainer;