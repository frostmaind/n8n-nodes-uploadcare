import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class UploadcareApi implements ICredentialType {
  name = 'uploadcareApi';
  displayName = 'Uploadcare API';
  documentationUrl = 'https://uploadcare.com/docs/rest_api/';
  properties: INodeProperties[] = [
    {
      displayName: 'Public Key',
      name: 'publicKey',
      type: 'string',
      default: '',
    },
    {
      displayName: 'Secret Key',
      name: 'privateKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
    },
  ];
}
