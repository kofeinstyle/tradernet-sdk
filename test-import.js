// Test script to reproduce the import issue
try {
  console.log('Attempting to import TradernetApiClient...');
  
  // Try importing from the package name (as it would be used in another project)
  import('@kofeinstyle/tradernet-sdk').then(module => {
    console.log('✅ Successfully imported module:', Object.keys(module));
    if (module.TradernetApiClient) {
      console.log('✅ TradernetApiClient is available');
      console.log('TradernetApiClient type:', typeof module.TradernetApiClient);
    } else {
      console.log('❌ TradernetApiClient is not available in the module');
    }
  }).catch(error => {
    console.log('❌ Failed to import module:', error.message);
  });
  
  // Also try importing from the local dist directory
  import('./dist/index.js').then(module => {
    console.log('✅ Successfully imported from local dist:', Object.keys(module));
    if (module.TradernetApiClient) {
      console.log('✅ TradernetApiClient is available from local dist');
    }
  }).catch(error => {
    console.log('❌ Failed to import from local dist:', error.message);
  });
  
} catch (error) {
  console.log('❌ Error during import test:', error.message);
}