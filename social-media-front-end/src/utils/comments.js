export function getComment(comments, commentID) {
  return comments.find((comment) => comment._id === commentID);
}

export function deleteComment(comments, comment) {
  if (!comment) return;
  return comments?.splice(comments?.indexOf(comment), 1);
}

export function deleteCommentChildren(comments, commentToDelete) {
  let childrenArray = commentToDelete.children;
  childrenArray.forEach((child) => {
    if (child?.children?.length) {
      deleteCommentChildren(comments, child);
    }
    deleteComment(comments, child);
  });
}

export function prepareComments(comments) {
  for (let i = 0; i < comments.length; i++) {
    comments[i].children = [];
  }

  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i];
    if (comment.parent) {
      const commentParent = getComment(comments, comment.parent);
      commentParent?.children.push(comment);
    }
  }
}
