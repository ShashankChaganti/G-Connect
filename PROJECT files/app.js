// Variables and classes
const postsContainer = document.getElementById("posts-container");
const addPostModal = document.getElementById("add-post-modal");
const showAddPostModal = document.getElementById("show-add-post-modal-btn");
const closeAddPostModal = document.getElementById("close-modal-btn");
const addPostForm = document.getElementById("add-post-form");

const posts = loadPostsFromLocalStorage();

class Post {
  constructor(id, title, content, comments = [], votes = 0) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.comments = comments;
    this.votes = votes;
  }
}

class Comment {
  constructor(id, parentId, postId, content, author) {
    this.id = id;
    this.parentId = parentId || null;
    this.postId = postId;
    this.content = content;
    this.author = author;
    this.childComments = [];
  }
}

// LocalStorage functions
function savePostsToLocalStorage() {
  localStorage.setItem("posts", JSON.stringify(posts));
}

function loadPostsFromLocalStorage() {
  const storedPosts = localStorage.getItem("posts");
  return storedPosts ? JSON.parse(storedPosts) : [];
}

// Add post functionality
if (showAddPostModal) {
  showAddPostModal.addEventListener("click", showModal);
  window.addEventListener("click", (event) => {
    if (event.target === addPostModal) {
      closeModal();
    }
  });
}

if (closeAddPostModal) {
  closeAddPostModal.addEventListener("click", closeModal);
}

function showModal() {
  addPostModal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeModal() {
  addPostModal.style.display = "none";
  document.body.style.overflow = "";
}

if (addPostForm) {
  addPostForm.addEventListener("submit", addPost);
}

function addPost(event) {
  event.preventDefault();
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;
  if (title && content) {
    const post = new Post(Date.now(), title, content);
    posts.unshift(post);
    savePostsToLocalStorage();
    renderPosts(posts);
    document.getElementById("title").value = "";
    document.getElementById("content").value = "";
    closeModal();
  }
}

// Add comment functionality
function addComment(event, postId) {
  event.preventDefault();
  const commentInput = document.getElementById(`comment-input-${postId}`);
  const commentAuthorInput = document.getElementById(`comment-author-input-${postId}`);
  const content = commentInput.value;
  const author = commentAuthorInput.value;
  if (content && author) {
    const comment = new Comment(Date.now(), null, postId, content, author);
    const post = posts.find((post) => post.id === postId);
    post.comments.push(comment);
    savePostsToLocalStorage();
    renderPosts(posts);
  }
}

// Render posts and comments
function renderPosts(posts) {
  postsContainer.innerHTML = "";
  if (posts.length === 0) {
    postsContainer.innerHTML = `<div class="no-posts"><p>No posts yet!</p></div>`;
  } else {
    posts.forEach((post) => {
      const postElement = document.createElement("div");
      postElement.classList.add("post");
      postElement.innerHTML = `
        <div class="post-votes">
          <button onclick="postVote(${post.id}, 'upvote')"><i class="las la-chevron-circle-up"></i></button>
          <span id="votes-${post.id}" class="${setPostVoteColor(post.votes)}">${post.votes}</span>
          <button onclick="postVote(${post.id}, 'downvote')"><i class="las la-chevron-circle-down"></i></button>
        </div>
        <div class="post-content">
          <h2><a href="post.html?id=${post.id}">${post.title}</a></h2>
          <p>${post.content}</p>
          <button onclick="deletePost(${post.id})" class="delete-post-btn">Delete</button>
          <div class="comments-section">
            ${post.comments.map(comment => renderComment(comment)).join('')}
            <form onsubmit="addComment(event, ${post.id})">
              <input type="text" id="comment-author-input-${post.id}" placeholder="Your name" required>
              <textarea id="comment-input-${post.id}" placeholder="Add a comment" required></textarea>
              <button type="submit">Reply</button>
            </form>
          </div>
        </div>
      `;
      postsContainer.appendChild(postElement);
    });
  }
}

function renderComment(comment) {
  return `
    <div class="comment">
      <p class="comment-author">${comment.author}</p>
      <p class="comment-content">${comment.content}</p>
    </div>
  `;
}

function postVote(id, type) {
  const post = posts.find((post) => post.id === id);
  post.votes += type === "upvote" ? 1 : -1;
  const votesElement = document.getElementById(`votes-${id}`);
  votesElement.innerText = post.votes;
  votesElement.className = setPostVoteColor(post.votes);
  savePostsToLocalStorage();
}

function setPostVoteColor(postVotes) {
  if (postVotes === 0) {
    return "";
  }
  return postVotes > 0 ? "positive" : "negative";
}

function deletePost(id) {
  const postIndex = posts.findIndex((post) => post.id === id);
  if (postIndex !== -1) {
    posts.splice(postIndex, 1);
    savePostsToLocalStorage();
    renderPosts(posts);
  }
}

renderPosts(posts);
