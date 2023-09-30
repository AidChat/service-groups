-- CreateEnum
CREATE TYPE "GroupTokens" AS ENUM ('Sports', 'Music', 'Movies', 'Gaming', 'Travel', 'Food', 'Technology', 'Fitness', 'Books', 'Fashion', 'Photography', 'Cooking', 'Politics', 'Science', 'Art', 'Pets', 'Business', 'Education', 'Health', 'Nature', 'History', 'DIY', 'Entertainment', 'Gardening', 'Parenting', 'Relationships', 'Religion', 'TVShows', 'Cars', 'Hiking', 'Outdoors', 'Shopping', 'Finance', 'Design', 'Comedy', 'Anime', 'Yoga', 'Dance', 'Crafts', 'Cycling', 'Programming', 'Writing', 'Traveling', 'News', 'Beauty', 'Environment', 'Astronomy', 'Paranormal', 'Philosophy', 'Psychology', 'Spirituality', 'SelfImprovement', 'MentalHealth', 'Love', 'Friendship', 'Grief', 'Hope', 'Anger', 'Anxiety', 'Depression', 'Happiness', 'Stress', 'Loneliness', 'Fear', 'Forgiveness', 'Acceptance', 'Empathy', 'Gratitude', 'Compassion', 'Resilience', 'Trust', 'Communication', 'Kindness', 'Motivation', 'Inspiration', 'Encouragement', 'Meditation', 'Mindfulness', 'Reflection', 'Dreaming', 'Adventure', 'Discovery', 'Nostalgia', 'Creativity', 'Curiosity', 'Simplicity', 'Freedom', 'Justice', 'Equality', 'Ethics', 'Leadership', 'Innovation', 'Change', 'Community', 'Diversity', 'Inclusion', 'Sustainability');

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER[],
    "groupDetailId" INTEGER NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupDetail" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "tags" "GroupTokens"[],

    CONSTRAINT "GroupDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "session_id" TEXT NOT NULL,
    "extended" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Socket" (
    "id" SERIAL NOT NULL,
    "socket_id" TEXT NOT NULL,

    CONSTRAINT "Socket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "sessionId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GroupToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_session_id_key" ON "Session"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "Session_userId_key" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_GroupToUser_AB_unique" ON "_GroupToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupToUser_B_index" ON "_GroupToUser"("B");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_groupDetailId_fkey" FOREIGN KEY ("groupDetailId") REFERENCES "GroupDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToUser" ADD CONSTRAINT "_GroupToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToUser" ADD CONSTRAINT "_GroupToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
