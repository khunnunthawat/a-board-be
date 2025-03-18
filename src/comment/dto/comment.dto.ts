export class CreateCommentDto {
  description: string;
  userId: string;
  postId: string;
}

export class UpdateCommentDto {
  description?: string;
}
