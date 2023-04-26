import React from "react";

import {
  onChildAdded,
  onChildRemoved,
  ref,
  remove,
  set,
  push,
} from "firebase/database";
import { database, storage } from "./firebase";
import { ref as storeRef, deleteObject } from "firebase/storage";

const DB_POSTS_KEY = "posts";
const STORE_IMAGE_KEY = "images";

class NewsFeed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
    };
  }

  handleDelete = (e) => {
    const id = e.target.id;
    const postRef = ref(database, `${DB_POSTS_KEY}/${id}`);
    remove(postRef);
    const imgID = e.target.getAttribute("img-id");
    if (imgID) {
      const imageRef = storeRef(
        storage,
        `${STORE_IMAGE_KEY}/${e.target.getAttribute("img-id")}`
      );
      deleteObject(imageRef);
    }
  };

  renderLikes = (likesObject) => {
    const listOfLikesLength = Object.keys(likesObject).length;
    // the first element of likesObject is true as a placeholder so that firebase will accept the write
    if (listOfLikesLength === 1) {
      return "0 Likes";
    } else if (listOfLikesLength === 2) {
      return "1 Like";
    } else {
      return listOfLikesLength - 1 + " Likes";
    }
  };

  likePost = (e) => {
    const id = e.target.id;
    // to use a UserID as the key, you have to target it using the ref() and then set() the value
    const likesRef = ref(
      database,
      `${DB_POSTS_KEY}/${id}/likes/${this.props.loggedInUserID}`
    );
    set(likesRef, true);
  };

  componentDidMount() {
    const postsRef = ref(database, DB_POSTS_KEY);
    // onChildAdded will return data for every child at the reference and every subsequent new child
    onChildAdded(postsRef, (data) => {
      // Add the subsequent child to local component state, initialising a new array to trigger re-render
      this.setState((state) => ({
        // Store post key so we can use it as a key in our list items when rendering posts
        posts: [
          ...state.posts,
          {
            key: data.key,
            text: data.val().text,
            date: data.val().date,
            imgURL: data.val().imgURL,
            imgID: data.val().imgID,
            displayName: data.val().displayName,
            likes: data.val().likes,
          },
        ],
      }));
    });
    onChildRemoved(postsRef, (removedPost) => {
      const remainingPosts = this.state.posts.filter((post) => {
        return post.key !== removedPost.key;
      });
      this.setState({
        posts: remainingPosts,
      });
    });
  }
  render() {
    // Convert messages in state to message JSX elements to render
    let postListItems = this.state.posts.map((post) => (
      <div key={post.key} className="post-bubble">
        <div className="post-display-name">
          <b>{post.displayName}</b>
        </div>
        {post.imgURL && <img src={post.imgURL} alt="user-content" />}
        <div className="post-text">{post.text}</div>
        <div className="post-date">{post.date}</div>
        <div className="post-likes">{this.renderLikes(post.likes)}</div>
        <button onClick={this.handleDelete} id={post.key} img-id={post.imgID}>
          Delete
        </button>
        <button onClick={this.likePost} id={post.key}>
          Like
        </button>
      </div>
    ));
    return (
      <div className="post-container">
        <h3>News Feed</h3>
        <div>{postListItems}</div>
      </div>
    );
  }
}

export default NewsFeed;
