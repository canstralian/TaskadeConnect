import { Client } from '@notionhq/client';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=notion',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Notion not connected');
  }
  return accessToken;
}

export async function getUncachableNotionClient() {
  const accessToken = await getAccessToken();
  return new Client({ auth: accessToken });
}

export class NotionService {
  async listDatabases() {
    const notion = await getUncachableNotionClient();
    const response = await notion.search({
      filter: { property: 'object', value: 'page' }
    });
    return response.results.filter((item: any) => item.object === 'database');
  }

  async createPage(databaseId: string, properties: any) {
    const notion = await getUncachableNotionClient();
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties,
    });
    return response;
  }

  async getPage(pageId: string) {
    const notion = await getUncachableNotionClient();
    const response = await notion.pages.retrieve({ page_id: pageId });
    return response;
  }

  async updatePage(pageId: string, properties: any) {
    const notion = await getUncachableNotionClient();
    const response = await notion.pages.update({
      page_id: pageId,
      properties,
    });
    return response;
  }

  async queryDatabase(databaseId: string, filter?: any) {
    const notion = await getUncachableNotionClient();
    const queryParams: any = { database_id: databaseId };
    if (filter) {
      queryParams.filter = filter;
    }
    const response = await (notion as any).databases.query(queryParams);
    return response.results;
  }

  async getDatabase(databaseId: string) {
    const notion = await getUncachableNotionClient();
    const response = await notion.databases.retrieve({ database_id: databaseId });
    return response;
  }
}

export const notionService = new NotionService();
