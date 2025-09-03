class HEICConverter {
    constructor() {
        this.files = [];
        this.convertedFiles = [];
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.uploadZone = document.getElementById('upload-zone');
        this.fileInput = document.getElementById('file-input');
        this.browseBtn = document.getElementById('browse-btn');
        this.fileList = document.getElementById('file-list');
        this.filesContainer = document.getElementById('files-container');
        this.formatSelect = document.getElementById('format-select');
        this.qualitySelect = document.getElementById('quality-select');
        this.qualityOption = document.getElementById('quality-option');
        this.convertBtn = document.getElementById('convert-btn');
        this.results = document.getElementById('results');
        this.resultsContainer = document.getElementById('results-container');
        this.downloadAllBtn = document.getElementById('download-all-btn');
    }

    bindEvents() {
        // Upload events
        this.browseBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
        this.uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadZone.style.borderColor = '#2563eb';
            this.uploadZone.style.backgroundColor = '#f0f9ff';
        });
        this.uploadZone.addEventListener('dragleave', () => {
            this.uploadZone.style.borderColor = '#cbd5e1';
            this.uploadZone.style.backgroundColor = '#fff';
        });
        this.uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadZone.style.borderColor = '#cbd5e1';
            this.uploadZone.style.backgroundColor = '#fff';
            this.handleFiles(e.dataTransfer.files);
        });

        // Format change
        this.formatSelect.addEventListener('change', () => {
            this.qualityOption.style.display = this.formatSelect.value === 'jpg' ? 'flex' : 'none';
        });

        // Convert button
        this.convertBtn.addEventListener('click', () => this.convertFiles());

        // Download all
        this.downloadAllBtn.addEventListener('click', () => this.downloadAllAsZip());
    }

    handleFiles(fileList) {
        const validFiles = Array.from(fileList).filter(file => 
            file.type === 'image/heic' || file.type === 'image/heif' || 
            file.name.toLowerCase().endsWith('.heic') || 
            file.name.toLowerCase().endsWith('.heif')
        );

        if (validFiles.length === 0) {
            alert('Please select valid HEIC/HEIF files.');
            return;
        }

        this.files = validFiles;
        this.displayFiles();
        this.fileList.style.display = 'block';
    }

    displayFiles() {
        this.filesContainer.innerHTML = '';
        this.files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${this.formatFileSize(file.size)}</span>
                </div>
            `;
            this.filesContainer.appendChild(fileItem);
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async convertFiles() {
        if (this.files.length === 0) return;

        this.convertBtn.disabled = true;
        this.convertBtn.textContent = 'Converting...';
        this.convertedFiles = [];

        const format = this.formatSelect.value;
        const quality = parseFloat(this.qualitySelect.value);

        try {
            for (let i = 0; i < this.files.length; i++) {
                const file = this.files[i];
                const blob = await heic2any({
                    blob: file,
                    toType: format === 'jpg' ? 'image/jpeg' : 'image/png',
                    quality: format === 'jpg' ? quality : undefined
                });

                const fileName = file.name.replace(/\.(heic|heif)$/i, `.${format}`);
                this.convertedFiles.push({
                    blob: blob,
                    name: fileName,
                    originalName: file.name
                });
            }

            this.displayResults();
            this.results.style.display = 'block';
            this.results.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Conversion error:', error);
            alert('Error converting files. Please try again.');
        } finally {
            this.convertBtn.disabled = false;
            this.convertBtn.textContent = 'Convert Files';
        }
    }

    // Replace the displayResults method in the existing main.js with this improved version:

// Update the displayResults method in your existing main.js:

displayResults() {
    this.resultsContainer.innerHTML = '';
    this.convertedFiles.forEach((file, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <div class="result-info">
                <div class="result-file-name">${file.name}</div>
                <div class="result-file-size">${this.formatFileSize(file.blob.size)}</div>
            </div>
            <a href="${URL.createObjectURL(file.blob)}" download="${file.name}" class="btn btn-secondary result-download-btn">Download</a>
        `;
        this.resultsContainer.appendChild(resultItem);
    });
}

    async downloadAllAsZip() {
        if (this.convertedFiles.length === 0) return;

        const zip = new JSZip();
        this.convertedFiles.forEach(file => {
            zip.file(file.name, file.blob);
        });

        try {
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, 'converted-images.zip');
        } catch (error) {
            console.error('ZIP creation error:', error);
            alert('Error creating ZIP file. Please try downloading individual files.');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HEICConverter();
});