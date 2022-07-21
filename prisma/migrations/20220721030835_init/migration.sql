-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "privateToken" TEXT,
    "roleName" TEXT NOT NULL DEFAULT 'User',
    "domain" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmbedOptions" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "siteName" TEXT DEFAULT 'Void',
    "siteNameUrl" TEXT,
    "title" TEXT,
    "color" TEXT DEFAULT '#B794F4',
    "description" TEXT,
    "author" TEXT,
    "authorUrl" TEXT
);

-- CreateTable
CREATE TABLE "Discord" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "avatar" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Url" (
    "id" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "short" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Url_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "name" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Role" (
    "name" TEXT NOT NULL,
    "color" TEXT DEFAULT '#B794F4',
    "rolePriority" INTEGER NOT NULL DEFAULT 100,
    "permissions" INTEGER NOT NULL DEFAULT 0,
    "maxFileSize" BIGINT NOT NULL DEFAULT 104857600,
    "maxFileCount" INTEGER NOT NULL DEFAULT 5,
    "storageQuota" BIGINT NOT NULL DEFAULT 5368709120,
    "maxRefCodes" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL DEFAULT 'application/octet-stream',
    "isExploding" BOOLEAN NOT NULL DEFAULT false,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "size" BIGINT NOT NULL DEFAULT 0,
    "slug" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletionToken" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralCode" (
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedBy" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ReferralCode_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "_DomainToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_privateToken_key" ON "User"("privateToken");

-- CreateIndex
CREATE UNIQUE INDEX "EmbedOptions_id_key" ON "EmbedOptions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Discord_id_key" ON "Discord"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Discord_accessToken_key" ON "Discord"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "Discord_refreshToken_key" ON "Discord"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "Discord_userId_key" ON "Discord"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Url_short_key" ON "Url"("short");

-- CreateIndex
CREATE UNIQUE INDEX "Role_rolePriority_key" ON "Role"("rolePriority");

-- CreateIndex
CREATE UNIQUE INDEX "File_slug_key" ON "File"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "File_deletionToken_key" ON "File"("deletionToken");

-- CreateIndex
CREATE UNIQUE INDEX "_DomainToUser_AB_unique" ON "_DomainToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_DomainToUser_B_index" ON "_DomainToUser"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleName_fkey" FOREIGN KEY ("roleName") REFERENCES "Role"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmbedOptions" ADD CONSTRAINT "EmbedOptions_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discord" ADD CONSTRAINT "Discord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Url" ADD CONSTRAINT "Url_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralCode" ADD CONSTRAINT "ReferralCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DomainToUser" ADD CONSTRAINT "_DomainToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Domain"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DomainToUser" ADD CONSTRAINT "_DomainToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
