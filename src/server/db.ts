import { MongoClient } from 'mongodb';
import { HomePageData, LaunchpadProject, ProjectApplication, SwapSettings, TransactionRecord } from '../types.js';

export interface ProjectPageQuery {
  page: number;
  limit: number;
  search?: string;
  stage?: string;
  walletAddress?: string;
}

export interface ProjectPageResult {
  projects: LaunchpadProject[];
  total: number;
  totalRaised: number;
  totalProjects: number;
  liveProjects: number;
}

interface PlatformSettingDocument<T> {
  key: string;
  value: T;
  updatedAt: number;
}


let cachedClient: MongoClient | null = null;
const DATABASE_NAME = process.env.MONGODB_DB || 'ton_launchpad';

async function getMongoDBCollection(collectionName: string = 'projects') {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri || mongoUri === 'MY_MONGODB_URI' || mongoUri.trim() === '') {
    throw new Error(
      'MONGODB_URI environment variable is required but is currently not configured. ' +
      'Please specify a valid MongoDB connection string in the Secrets/Environment settings.'
    );
  }

  if (!cachedClient) {
    try {
      cachedClient = new MongoClient(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
      });
      console.log('MongoDB client initialized.');
    } catch (err: any) {
      console.error('Error initializing MongoDB client:', err);
      throw new Error(`Failed to initialize MongoDB client: ${err.message}`);
    }
  }

  try {
    await cachedClient.connect();
    const db = cachedClient.db(DATABASE_NAME);
    return db.collection(collectionName);
  } catch (err: any) {
    console.error('MongoDB database connection error:', err);
    const errMsg = err.message || String(err);
    if (
      errMsg.includes('tlsv1 alert internal error') || 
      errMsg.includes('alert number 80') || 
      errMsg.includes('SSL routines') || 
      errMsg.includes('MongoServerSelectionError')
    ) {
      throw new Error(
        `Connection blocked by MongoDB Atlas firewall (TLS SSL Alert 80). \n\n` +
        `This error means Atlas rejected the secure handshake request because the Cloud Run container's outbound dynamic IP resides outside your network whitelist.\n\n` +
        `To fix this:\n` +
        `1. Navigate to your MongoDB Atlas dashboard.\n` +
        `2. Go to "Network Access" under the Security menu.\n` +
        `3. Click "Add IP Address" and set it to allow access from anywhere (0.0.0.5/0 represents nowhere, so whitelist 0.0.0.0/0 instead) or choose the "Allow Access From Anywhere" presets.`
      );
    }
    throw new Error(`Failed to connect to MongoDB: ${errMsg}`);
  }
}

export async function getDatabaseHealth() {
  const collection = await getMongoDBCollection('projects');
  const projects = await collection.countDocuments({});
  return {
    connected: true,
    database: DATABASE_NAME,
    projects,
  };
}

/**
 * Read list of launchpad projects from MongoDB only.
 * No fallback file/local DB mechanism is used.
 */
export async function getDatabase(): Promise<LaunchpadProject[]> {
  const collection = await getMongoDBCollection('projects');
  const items = await collection.find({}).toArray();

  // Convert Mongo documents to LaunchpadProject by removing the internal _id
  return items.map(item => {
    const { _id, ...cleanProject } = item as any;
    if (!Array.isArray(cleanProject.contributions)) {
      cleanProject.contributions = [];
    }
    if (!Array.isArray(cleanProject.whitelistedAddresses)) {
      cleanProject.whitelistedAddresses = [];
    }
    if (!cleanProject.votedAddresses) {
      cleanProject.votedAddresses = {};
    }
    if (!cleanProject.voteProgressByAddress) {
      cleanProject.voteProgressByAddress = {};
    }
    if (!cleanProject.kycStatus) {
      cleanProject.kycStatus = 'not_submitted';
    }
    if (!cleanProject.auditStatus) {
      cleanProject.auditStatus = cleanProject.aiAudit ? 'automated_review' : 'not_submitted';
    }
    if (typeof cleanProject.enabled !== 'boolean') {
      cleanProject.enabled = true;
    }
    if (typeof cleanProject.promoted !== 'boolean') {
      cleanProject.promoted = false;
    }
    if (!cleanProject.listingStatus) {
      cleanProject.listingStatus = 'auto';
    }
    if (cleanProject.idoStage === 'voting') {
      cleanProject.idoStage = 'vote';
    }
    return cleanProject as LaunchpadProject;
  });
}

const cleanProjectDocument = (item: any): LaunchpadProject => {
  const { _id, ...cleanProject } = item;
  if (!Array.isArray(cleanProject.contributions)) cleanProject.contributions = [];
  if (!Array.isArray(cleanProject.whitelistedAddresses)) cleanProject.whitelistedAddresses = [];
  if (!cleanProject.votedAddresses) cleanProject.votedAddresses = {};
  if (!cleanProject.voteProgressByAddress) cleanProject.voteProgressByAddress = {};
  if (!cleanProject.kycStatus) cleanProject.kycStatus = 'not_submitted';
  if (!cleanProject.auditStatus) cleanProject.auditStatus = cleanProject.aiAudit ? 'automated_review' : 'not_submitted';
  if (typeof cleanProject.enabled !== 'boolean') cleanProject.enabled = true;
  if (typeof cleanProject.promoted !== 'boolean') cleanProject.promoted = false;
  if (!cleanProject.listingStatus) cleanProject.listingStatus = 'auto';
  if (cleanProject.idoStage === 'voting') cleanProject.idoStage = 'vote';
  return cleanProject as LaunchpadProject;
};

export async function getHomePageData(): Promise<HomePageData> {
  const collection = await getMongoDBCollection('projects');
  const visibleFilter = {
    enabled: { $ne: false },
    listingStatus: { $ne: 'hidden' },
  };
  const liveFilter = {
    ...visibleFilter,
    idoContractAddress: { $exists: true, $ne: '' },
    idoStage: { $in: ['vote', 'preparation', 'whitelist', 'sale'] },
    listingStatus: { $ne: 'under_review' },
  };
  const upcomingFilter = {
    ...visibleFilter,
    idoStage: 'upcoming',
  };
  const underReviewFilter = { ...visibleFilter, listingStatus: 'under_review' };
  const pastFilter = {
    ...visibleFilter,
    idoContractAddress: { $exists: true, $ne: '' },
    idoStage: 'distribution',
    listingStatus: { $ne: 'hidden' },
  };

  const [liveItems, upcomingItems, underReviewItems, pastItems, promotedItems, stats] = await Promise.all([
    collection.aggregate([
      { $match: liveFilter },
      { $sort: { raised: -1, startTime: -1 } },
      { $limit: 3 },
    ]).toArray(),
    collection.find(upcomingFilter).sort({ startTime: 1 }).limit(3).toArray(),
    collection.find(underReviewFilter).sort({ startTime: -1 }).limit(6).toArray(),
    collection.find(pastFilter).sort({ endTime: -1 }).limit(3).toArray(),
    collection.find({ ...visibleFilter, promoted: true }).sort({ raised: -1, startTime: -1 }).toArray(),
    collection.aggregate([
      { $match: visibleFilter },
      {
        $group: {
          _id: null,
          totalRaised: { $sum: { $ifNull: ['$raised', 0] } },
          totalProjects: { $sum: 1 },
          liveProjects: {
            $sum: {
              $cond: [
                { $in: ['$idoStage', ['vote', 'preparation', 'whitelist', 'sale']] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]).toArray(),
  ]);

  const liveProjects = liveItems.map(cleanProjectDocument);
  return {
    trendingProjects: liveProjects.slice(0, 3),
    promotedProjects: promotedItems.map(cleanProjectDocument),
    liveProjects,
    upcomingProjects: upcomingItems.map(cleanProjectDocument),
    underReviewProjects: underReviewItems.map(cleanProjectDocument),
    pastProjects: pastItems.map(cleanProjectDocument),
    stats: {
      totalRaised: Number(stats[0]?.totalRaised || 0),
      totalProjects: Number(stats[0]?.totalProjects || 0),
      liveProjects: Number(stats[0]?.liveProjects || 0),
    },
  };
}

export async function getProjectPage(query: ProjectPageQuery, includeDisabled = false): Promise<ProjectPageResult> {
  const collection = await getMongoDBCollection('projects');
  const hasSearch = Boolean(query.search?.trim());
  const filter: Record<string, any> = {};
  if (!includeDisabled) {
    filter.enabled = { $ne: false };
    filter.listingStatus = { $ne: 'hidden' };
  }

  

  if (query.search?.trim()) {
    const escapedSearch = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: { $regex: escapedSearch, $options: 'i' } },
      { symbol: { $regex: escapedSearch, $options: 'i' } },
      { description: { $regex: escapedSearch, $options: 'i' } },
    ];
  }

  const activeStageValues = ['upcoming', 'Upcoming', 'vote', 'Vote', 'voting', 'Voting', 'preparation', 'Preparation', 'whitelist', 'Whitelist', 'sale', 'Sale'];

  
  if (hasSearch) {
    filter.listingStatus = { $ne: 'hidden' };
  } else if (!query.stage || query.stage === 'all') {
    filter.idoStage = { $in: activeStageValues };
    filter.listingStatus = { $nin: ['hidden', 'under_review'] };
  } else if (query.stage === 'upcoming') {
    filter.$and = [...(filter.$and || []), {
      $or: [
        { idoStage: 'upcoming' },
        { listingStatus: 'upcoming' },
      ],
    }];
  } else if (query.stage === 'vote') {
    filter.idoStage = { $in: ['vote', 'Vote', 'voting', 'Voting'] };
    filter.listingStatus = { $nin: ['hidden', 'under_review'] };
  } else if (query.stage !== 'my') {
    filter.idoStage = query.stage;
    filter.listingStatus = { $nin: ['hidden', 'under_review'] };
  }

  if (query.stage === 'my' && query.walletAddress) {
    const walletFilter = [
      { creator: query.walletAddress },
      { 'contributions.contributor': query.walletAddress },
    ];
    filter.$and = [...(filter.$and || []), { $or: walletFilter }];
  }

  const skip = (query.page - 1) * query.limit;
  const [items, total, stats] = await Promise.all([
    collection.find(filter).sort({ startTime: -1 }).skip(skip).limit(query.limit).toArray(),
    collection.countDocuments(filter),
    collection.aggregate([
      { $match: includeDisabled ? {} : { enabled: { $ne: false }, listingStatus: { $ne: 'hidden' } } },
      {
        $group: {
          _id: null,
          totalRaised: { $sum: { $ifNull: ['$raised', 0] } },
          totalProjects: { $sum: 1 },
          liveProjects: {
            $sum: {
              $cond: [
                { $in: ['$idoStage', activeStageValues] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]).toArray(),
  ]);

  return {
    projects: items.map(cleanProjectDocument),
    total,
    totalRaised: Number(stats[0]?.totalRaised || 0),
    totalProjects: Number(stats[0]?.totalProjects || 0),
    liveProjects: Number(stats[0]?.liveProjects || 0),
  };
}

export async function getProjectsForWallet(walletAddress: string): Promise<LaunchpadProject[]> {
  const collection = await getMongoDBCollection('projects');
  const items = await collection.find({
    enabled: { $ne: false },
    listingStatus: { $ne: 'hidden' },
    $or: [
      { creator: walletAddress },
      { 'contributions.contributor': walletAddress },
    ],
  }).sort({ startTime: -1 }).toArray();

  return items.map(cleanProjectDocument);
}

/**
 * Save list of launchpad projects to MongoDB only.
 * No fallback file/local DB mechanism is used.
 */
export async function saveDatabase(projects: LaunchpadProject[]): Promise<void> {
  const collection = await getMongoDBCollection('projects');
  if (projects.length === 0) {
    return;
  }

  const bulkOps = projects.map(p => {
    const { _id, ...cleanProject } = p as any;
    return {
      replaceOne: {
        filter: { id: p.id },
        replacement: cleanProject,
        upsert: true
      }
    };
  });

  await collection.bulkWrite(bulkOps);
  console.log(`Successfully upserted ${projects.length} projects to MongoDB.`);
}

/**
 * Retrieve transaction logs for a user from MongoDB.
 */
export async function getTransactions(userAddress?: string): Promise<TransactionRecord[]> {
  const collection = await getMongoDBCollection('transactions');
  const filter = userAddress ? { address: userAddress.trim().toLowerCase() } : {};
  const items = await collection.find(filter).sort({ timestamp: -1 }).toArray();

  return items.map(item => {
    const { _id, ...cleanTx } = item as any;
    return cleanTx as TransactionRecord;
  });
}

/**
 * Save a single transaction record to MongoDB.
 */
export async function addTransaction(tx: TransactionRecord & { address: string }): Promise<void> {
  const collection = await getMongoDBCollection('transactions');
  const cleanTx = {
    ...tx,
    address: tx.address.trim().toLowerCase()
  };
  delete (cleanTx as any)._id; // Avoid any ID clash
  await collection.insertOne(cleanTx);
  console.log(`Saved transaction ${tx.id} for ${tx.address} to MongoDB.`);
}

export async function addProjectApplication(application: ProjectApplication): Promise<void> {
  const collection = await getMongoDBCollection('project_applications');
  await collection.insertOne(application as any);
}

export async function getProjectApplications(): Promise<ProjectApplication[]> {
  const collection = await getMongoDBCollection('project_applications');
  const items = await collection.find({}).sort({ submittedAt: -1 }).toArray();
  return items.map(item => {
    const { _id, ...application } = item as any;
    if (!application.status) {
      application.status = 'in_review';
    }
    return application as ProjectApplication;
  });
}

export async function updateApplicationStatus(id: string, status: 'in_review' | 'approved' | 'rejected'): Promise<boolean> {
  const collection = await getMongoDBCollection('project_applications');
  const result = await collection.updateOne({ id }, { $set: { status } });
  return result.matchedCount > 0;
}

export async function getSwapSettings(): Promise<SwapSettings | null> {
  const collection = await getMongoDBCollection('platform_settings');
  const item = await collection.findOne({ key: 'swap' });
  if (!item) return null;

  const doc = item as unknown as PlatformSettingDocument<SwapSettings>;
  const value = doc.value;
  return {
    ...value,
    updatedAt: Number((item as any).updatedAt || value.updatedAt || Date.now()),
  };
}

export async function saveSwapSettings(settings: SwapSettings): Promise<void> {
  const collection = await getMongoDBCollection('platform_settings');
  await collection.updateOne(
    { key: 'swap' },
    {
      $set: {
        key: 'swap',
        value: settings,
        updatedAt: Date.now(),
      },
    },
    { upsert: true }
  );
}
