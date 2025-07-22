import {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
  NodeConnectionType,
} from 'n8n-workflow';

import {
  UploadClient,
  uploadFile,
  uploadFileGroup,
  uploadFromUrl,
  uploadFromUploaded,
  uploadDirect,
  uploadMultipart,
} from '@uploadcare/upload-client';

import {
  UploadcareSimpleAuthSchema,
  listOfFiles,
  fileInfo,
  storeFile,
  storeFiles,
  deleteFile,
  deleteFiles,
  copyFileToLocalStorage,
  copyFileToRemoteStorage,
  listOfGroups,
  groupInfo,
  deleteGroup,
  updateMetadata,
  getMetadata,
  getMetadataValue,
  deleteMetadata,
  listOfWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  convert,
  conversionJobStatus,
  conversionInfo,
  executeAddon,
  addonExecutionStatus,
  WebhookEvent,
} from '@uploadcare/rest-client';

export class Uploadcare implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Uploadcare (Full API)',
    name: 'uploadcare',
    icon: 'file:uploadcare.svg',
    group: ['transform'],
    version: 1,
    description: 'Full-featured Uploadcare integration for n8n (all upload-client and rest-client methods)',
    defaults: { name: 'Uploadcare', color: '#1A82E2' },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    credentials: [{ name: 'uploadcareApi', required: true }],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        options: [
          { name: 'uploadFile', value: 'uploadFile' },
          { name: 'uploadFileGroup', value: 'uploadFileGroup' },
          { name: 'uploadFromUrl', value: 'uploadFromUrl' },
          { name: 'uploadFromUploaded', value: 'uploadFromUploaded' },
          { name: 'uploadDirect', value: 'uploadDirect' },
          { name: 'uploadMultipart', value: 'uploadMultipart' },
          { name: 'listOfFiles', value: 'listOfFiles' },
          { name: 'fileInfo', value: 'fileInfo' },
          { name: 'storeFile', value: 'storeFile' },
          { name: 'storeFiles', value: 'storeFiles' },
          { name: 'deleteFile', value: 'deleteFile' },
          { name: 'deleteFiles', value: 'deleteFiles' },
          { name: 'copyFileToLocalStorage', value: 'copyFileToLocalStorage' },
          { name: 'copyFileToRemoteStorage', value: 'copyFileToRemoteStorage' },
          { name: 'listOfGroups', value: 'listOfGroups' },
          { name: 'groupInfo', value: 'groupInfo' },
          { name: 'deleteGroup', value: 'deleteGroup' },
          { name: 'updateMetadata', value: 'updateMetadata' },
          { name: 'getMetadata', value: 'getMetadata' },
          { name: 'getMetadataValue', value: 'getMetadataValue' },
          { name: 'deleteMetadata', value: 'deleteMetadata' },
          { name: 'listOfWebhooks', value: 'listOfWebhooks' },
          { name: 'createWebhook', value: 'createWebhook' },
          { name: 'updateWebhook', value: 'updateWebhook' },
          { name: 'deleteWebhook', value: 'deleteWebhook' },
          { name: 'convert', value: 'convert' },
          { name: 'conversionJobStatus', value: 'conversionJobStatus' },
          { name: 'conversionInfo', value: 'conversionInfo' },
          { name: 'executeAddon', value: 'executeAddon' },
          { name: 'addonExecutionStatus', value: 'addonExecutionStatus' },
        ],
        default: 'uploadFile',
      },

      // Binary for file upload
      {
        displayName: 'Binary Property',
        name: 'binaryProperty',
        type: 'string',
        default: 'data',
        description: 'Name of the binary property that contains the file to upload.',
        displayOptions: { show: { operation: ['uploadFile', 'uploadDirect', 'uploadMultipart'] } },
      },
      // For group upload
      {
        displayName: 'Binary Properties (Array)',
        name: 'binaryProperties',
        type: 'string',
        default: '',
        description: 'Comma-separated list of binary properties for group upload.',
        displayOptions: { show: { operation: ['uploadFileGroup'] } },
      },
      // For upload from URL / uploaded UUID
      {
        displayName: 'Source URL',
        name: 'sourceUrl',
        type: 'string',
        default: '',
        description: 'File URL for uploadFromUrl',
        displayOptions: { show: { operation: ['uploadFromUrl'] } },
      },
      // For uuid operations
      {
        displayName: 'UUID',
        name: 'uuid',
        type: 'string',
        default: '',
        description: 'File or group UUID (for fileInfo, storeFile, deleteFile, etc)',
        displayOptions: { show: { operation: ['fileInfo', 'storeFile', 'deleteFile', 'updateMetadata', 'getMetadata', 'getMetadataValue', 'deleteMetadata', 'conversionInfo', 'uploadFromUploaded', 'copyFileToLocalStorage', 'copyFileToRemoteStorage', 'executeAddon'] } },
      },
      {
        displayName: 'UUIDs',
        name: 'uuids',
        type: 'string',
        typeOptions: { multipleValues: true },
        default: '',
        description: 'Array of file UUIDs (for batch storeFiles/deleteFiles, uploadFileGroup)',
        displayOptions: { show: { operation: ['storeFiles', 'deleteFiles', 'uploadFileGroup'] } },
      },
      {
        displayName: 'Group ID',
        name: 'groupId',
        type: 'string',
        default: '',
        description: 'Group UUID (for groupInfo, deleteGroup)',
        displayOptions: { show: { operation: ['groupInfo', 'deleteGroup'] } },
      },
      // Metadata
      {
        displayName: 'Metadata Key',
        name: 'key',
        type: 'string',
        default: '',
        description: 'Metadata key (for getMetadataValue, updateMetadata, deleteMetadata)',
        displayOptions: { show: { operation: ['getMetadataValue', 'updateMetadata', 'deleteMetadata'] } },
      },
      {
        displayName: 'Metadata Value',
        name: 'value',
        type: 'string',
        default: '',
        description: 'Metadata value (for updateMetadata)',
        displayOptions: { show: { operation: ['updateMetadata'] } },
      },
      // Webhook/event
      {
        displayName: 'Target URL',
        name: 'targetUrl',
        type: 'string',
        default: '',
        description: 'Webhook target URL (for createWebhook, updateWebhook, deleteWebhook)',
        displayOptions: { show: { operation: ['createWebhook', 'updateWebhook', 'deleteWebhook'] } },
      },
      {
        displayName: 'Webhook ID',
        name: 'webhookId',
        type: 'number',
        default: 0,
        description: 'Webhook ID (for updateWebhook)',
        displayOptions: { show: { operation: ['updateWebhook'] } },
      },
      {
        displayName: 'Event',
        name: 'event',
        type: 'string',
        default: '',
        description: 'Webhook event (for createWebhook, updateWebhook)',
        displayOptions: { show: { operation: ['createWebhook', 'updateWebhook'] } },
      },
      // Conversion/Addon
      {
        displayName: 'Conversion Type',
        name: 'type',
        type: 'string',
        default: '',
        description: 'Conversion type (for convert, conversionJobStatus)',
        displayOptions: { show: { operation: ['convert', 'conversionJobStatus'] } },
      },
      {
        displayName: 'Paths',
        name: 'paths',
        type: 'string',
        typeOptions: { multipleValues: true },
        default: '',
        description: 'Array of transformation paths (for convert)',
        displayOptions: { show: { operation: ['convert'] } },
      },
      {
        displayName: 'Conversion Token',
        name: 'token',
        type: 'string',
        default: '',
        description: 'Token for conversionJobStatus',
        displayOptions: { show: { operation: ['conversionJobStatus'] } },
      },
      {
        displayName: 'Addon Name',
        name: 'addonName',
        type: 'string',
        default: '',
        description: 'Addon name (for executeAddon/addonExecutionStatus)',
        displayOptions: { show: { operation: ['executeAddon', 'addonExecutionStatus'] } },
      },
      {
        displayName: 'Request ID',
        name: 'requestId',
        type: 'string',
        default: '',
        description: 'Request ID for addonExecutionStatus',
        displayOptions: { show: { operation: ['addonExecutionStatus'] } },
      },
      // For remote storage copy
      {
        displayName: 'Target',
        name: 'target',
        type: 'string',
        default: '',
        description: 'Remote storage target name (for copyFileToRemoteStorage)',
        displayOptions: { show: { operation: ['copyFileToRemoteStorage'] } },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const creds = await this.getCredentials('uploadcareApi') as any;
    const uploadClient = new UploadClient({ publicKey: creds.publicKey });
    const auth = new UploadcareSimpleAuthSchema({ publicKey: creds.publicKey, secretKey: creds.privateKey });
    const out: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const op = this.getNodeParameter('operation', i) as string;
      let res: any;

      // --- upload-client methods ---
      if (op === 'uploadFile') {
        const bin = await this.helpers.getBinaryDataBuffer(i, this.getNodeParameter('binaryProperty', i) as string);
        res = await uploadFile(bin, { publicKey: creds.publicKey });
      } else if (op === 'uploadFileGroup') {
        const binaryProperties = this.getNodeParameter('binaryProperties', i) as string;
        const uuids = this.getNodeParameter('uuids', i, []) as string[];
        let files: any[] = [];
        if (binaryProperties) {
          const propList = binaryProperties.split(',').map(p => p.trim());
          files = await Promise.all(propList.map(async prop => await this.helpers.getBinaryDataBuffer(i, prop)));
        } else if (uuids.length) {
          files = uuids;
        }
        res = await uploadFileGroup(files, { publicKey: creds.publicKey });
      } else if (op === 'uploadFromUrl') {
        res = await uploadFromUrl(this.getNodeParameter('sourceUrl', i) as string, { publicKey: creds.publicKey });
      } else if (op === 'uploadFromUploaded') {
        res = await uploadFromUploaded(this.getNodeParameter('uuid', i) as string, { publicKey: creds.publicKey });
      } else if (op === 'uploadDirect') {
        const bin = await this.helpers.getBinaryDataBuffer(i, this.getNodeParameter('binaryProperty', i) as string);
        res = await uploadDirect(bin, { publicKey: creds.publicKey });
      } else if (op === 'uploadMultipart') {
        const bin = await this.helpers.getBinaryDataBuffer(i, this.getNodeParameter('binaryProperty', i) as string);
        res = await uploadMultipart(bin, { publicKey: creds.publicKey });
      }
      // --- rest-client methods ---
      else if (op === 'listOfFiles') {
        res = await listOfFiles({}, { authSchema: auth });
      } else if (op === 'fileInfo') {
        res = await fileInfo({ uuid: this.getNodeParameter('uuid', i) as string }, { authSchema: auth });
      } else if (op === 'storeFile') {
        res = await storeFile({ uuid: this.getNodeParameter('uuid', i) as string }, { authSchema: auth });
      } else if (op === 'storeFiles') {
        res = await storeFiles({ uuids: this.getNodeParameter('uuids', i) as string[] }, { authSchema: auth });
      } else if (op === 'deleteFile') {
        res = await deleteFile({ uuid: this.getNodeParameter('uuid', i) as string }, { authSchema: auth });
      } else if (op === 'deleteFiles') {
        res = await deleteFiles({ uuids: this.getNodeParameter('uuids', i) as string[] }, { authSchema: auth });
      } else if (op === 'copyFileToLocalStorage') {
        res = await copyFileToLocalStorage({ source: this.getNodeParameter('uuid', i) as string }, { authSchema: auth });
      } else if (op === 'copyFileToRemoteStorage') {
        res = await copyFileToRemoteStorage({ source: this.getNodeParameter('uuid', i) as string, target: this.getNodeParameter('target', i) as string }, { authSchema: auth });
      } else if (op === 'listOfGroups') {
        res = await listOfGroups({}, { authSchema: auth });
      } else if (op === 'groupInfo') {
        res = await groupInfo({ uuid: this.getNodeParameter('groupId', i) as string }, { authSchema: auth });
      } else if (op === 'deleteGroup') {
        res = await deleteGroup({ uuid: this.getNodeParameter('groupId', i) as string }, { authSchema: auth });
      } else if (op === 'updateMetadata') {
        res = await updateMetadata({
          uuid: this.getNodeParameter('uuid', i) as string,
          key: this.getNodeParameter('key', i) as string,
          value: this.getNodeParameter('value', i) as string,
        }, { authSchema: auth });
      } else if (op === 'getMetadata') {
        res = await getMetadata({ uuid: this.getNodeParameter('uuid', i) as string }, { authSchema: auth });
      } else if (op === 'getMetadataValue') {
        res = await getMetadataValue({ uuid: this.getNodeParameter('uuid', i) as string, key: this.getNodeParameter('key', i) as string }, { authSchema: auth });
      } else if (op === 'deleteMetadata') {
        res = await deleteMetadata({ uuid: this.getNodeParameter('uuid', i) as string, key: this.getNodeParameter('key', i) as string }, { authSchema: auth });
      } else if (op === 'listOfWebhooks') {
        res = await listOfWebhooks({}, { authSchema: auth });
      } else if (op === 'createWebhook') {
        res = await createWebhook({ targetUrl: this.getNodeParameter('targetUrl', i) as string, event: this.getNodeParameter('event', i) as WebhookEvent }, { authSchema: auth });
      } else if (op === 'updateWebhook') {
        res = await updateWebhook({
          id: this.getNodeParameter('webhookId', i) as number,
          targetUrl: this.getNodeParameter('targetUrl', i) as string,
          event: this.getNodeParameter('event', i) as WebhookEvent,
        }, { authSchema: auth });
      } else if (op === 'deleteWebhook') {
        res = await deleteWebhook({ targetUrl: this.getNodeParameter('targetUrl', i) as string }, { authSchema: auth });
      } else if (op === 'convert') {
        res = await convert({ type: this.getNodeParameter('type', i) as any, paths: this.getNodeParameter('paths', i) as string[] }, { authSchema: auth });
      } else if (op === 'conversionJobStatus') {
        res = await conversionJobStatus({ type: this.getNodeParameter('type', i) as any, token: this.getNodeParameter('token', i) as number }, { authSchema: auth });
      } else if (op === 'conversionInfo') {
        res = await conversionInfo({ uuid: this.getNodeParameter('uuid', i) as string }, { authSchema: auth });
      } else if (op === 'executeAddon') {
        res = await executeAddon({ addonName: this.getNodeParameter('addonName', i) as any, target: this.getNodeParameter('uuid', i) as string }, { authSchema: auth });
      } else if (op === 'addonExecutionStatus') {
        res = await addonExecutionStatus({ requestId: this.getNodeParameter('requestId', i) as string, addonName: this.getNodeParameter('addonName', i) as any }, { authSchema: auth });
      } else {
        throw new Error('Unknown operation');
      }

      out.push({ json: res });
    }
    return [out];
  }
}
