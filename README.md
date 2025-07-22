# n8n-nodes-uploadcare

The `n8n-nodes-uploadcare` repository provides a template for creating custom n8n nodes and credentials specifically for uploadcare.com integration.

The repository includes examples, documentation, and tools to help developers integrate Uploadcare with n8n workflows.

## Documentation

### Installation

To install the custom Uploadcare nodes in your n8n instance, clone this repository and follow the standard n8n community node installation process:

```bash
npm install n8n-nodes-uploadcare
```

### Usage

After installation, you will see new Uploadcare nodes available in the n8n workflow editor. These nodes allow you to:

- Authenticate with Uploadcare
- Upload files
- List files
- Delete files
- Perform other Uploadcare API operations

#### 1. **Add Credentials**

- Go to **Credentials** in n8n.
- Add new credentials for Uploadcare.
- Fill in your Uploadcare Public and Secret keys.

#### 2. **Using the Nodes**

- In your workflow, add an Uploadcare node (e.g., "Uploadcare Upload File").
- Configure the operation and parameters as needed (file path, UUID, etc.).
- Connect it to other nodes (e.g., HTTP Request, Function, Email).

### Example Workflow

Here's a simple example of uploading a file to Uploadcare:

1. Use a File Trigger node to watch for new files.
2. Add the **Uploadcare Upload File** node.
3. Map the incoming file path.
4. Connect to downstream processing nodes.

### Support

For further assistance:

- Open an issue on this repository
- Visit the [n8n Documentation](https://docs.n8n.io/)
- Check the [Uploadcare API documentation](https://uploadcare.com/docs/rest/)
