#!/bin/sh

echo "generate storefront config and start it"
echo "you have to define at least ENV, APIURL, THEME, THEMEREPOURL, GITHUB_USER and GITHUB_PASS parameters"
echo "USESTRICT, FBAPPID, GOOGLECLIENTID, GOOGLEANALYTICSID, THEME_BRANCH, INSTAGRAMCLIENTID, INSTAGRAMCLIENTTOCKEN are optional parametes"

if ! [ -n "$ENV" ] ; then
  echo "you have to define ENV environment parameter. Can be set to stage or prod"
  exit 2
fi
if ! [ -n "$APIURL" ] ; then
  echo "you have to define APIURL environment parameter"
  exit 2
fi
if ! [ -n "$THEME" ] ; then
  echo "you have to define THEME environment parameter"
  exit 2
fi
if ! [ -n "$THEMEREPOURL" ] ; then
  echo "you have to define THEMEREPOURL environment parameter"
  exit 2
fi
if ! [ -n "$GITHUB_USER" ] ; then
  echo "you have to define GITHUB_USER environment parameter"
  exit 2
fi
if ! [ -n "$GITHUB_PASS" ] ; then
  echo "you have to define GITHUB_PASS environment parameter"
  exit 2
fi
if [ -n "$MEDIAFOLDER" ] ; then
  mkdir -p $MEDIAFOLDER
  ln -s $MEDIAFOLDER /home/ottemo/media
fi

FBAPPID="${FBAPPID:-undefined}"
GOOGLECLIENTID="${GOOGLECLIENTID:-undefined}"
GOOGLEANALYTICSID="${GOOGLEANALYTICSID:-undefined}"
THEME_BRANCH="${THEME_BRANCH:-develop}"
INSTAGRAMCLIENTID="${INSTAGRAMCLIENTID:-undefined}"
INSTAGRAMCLIENTTOCKEN="${INSTAGRAMCLIENTTOCKEN:-undefined}"

cat << EOF > config/current.json
{
  "useStrict": "$USESTRICT",
  "apiUrl": "$APIURL",
  "fbAppId": "$FBAPPID",
  "theme": "$THEME",
  "themeRepoUrl": "$THEMEREPOURL",
  "googleClientId": "$GOOGLECLIENTID",
  "googleAnalyticsId": "$GOOGLEANALYTICSID",
  "instagramClientId": "$INSTAGRAMCLIENTID",
  "instagramClientToken": "$INSTAGRAMCLIENTTOCKEN"
}
EOF

echo "use follow dashboard config:"
cat config/current.json

THEMEREPOURL="http://$GITHUB_USER:$GITHUB_PASS@$THEMEREPOURL"
echo "clonning $THEMEREPOURL to /home/ottemo/store/src/themes/"
cd /home/ottemo/store/src/themes/ && git clone -b $THEME_BRANCH $THEMEREPOURL

/usr/local/bin/gulp serve --env=$ENV --config=current
