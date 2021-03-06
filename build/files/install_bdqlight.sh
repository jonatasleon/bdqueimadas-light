#!/bin/bash

function valid()
{
  if [ $1 -ne 0 ]; then
    echo "$2"
    exit $1
  else
    echo "done"
  fi
}

mkdir $BDQLIGHT_INSTALL_PATH

echo -ne "Cloning BDQueimadas Light ... "
git clone https://github.com/jonatasleon/bdqueimadas-light $BDQLIGHT_INSTALL_PATH/.
valid $? "Error: Could not clone BDQueimadas Light"

cd $BDQLIGHT_INSTALL_PATH

git checkout tags/${BDQLIGHT_VERSION}

npm install
grunt

# No error
exit 0
