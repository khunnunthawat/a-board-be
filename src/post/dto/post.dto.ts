import { CommunityType } from '../../types/community.enum';

export class CreatePostDto {
  title: string;
  description: string;
  community: CommunityType;
  userId: string;
}
